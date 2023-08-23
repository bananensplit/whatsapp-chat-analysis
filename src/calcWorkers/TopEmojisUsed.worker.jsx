import * as dataForge from "data-forge";
import moment from "moment";

self.onmessage = (message) => {
    const start = performance.now();

    const emoji = dataForge.fromJSON(message.data.emoji);

    const chatDataWithoutMedia = dataForge
        .fromJSON(message.data.chatDataWithoutMedia)
        .transformSeries({
            datetime: (datetime) => moment(datetime),
        });

    const senders = chatDataWithoutMedia.getSeries("sender").distinct();

    const emojiRegex = "(" + emoji.getSeries("emoji").toArray().join("|") + ")";

    const emojiCounts = chatDataWithoutMedia
        .selectMany((row) => row.message.match(new RegExp(emojiRegex, "gu")) || [])
        .deflate()
        .groupBy((emoji) => emoji)
        .select((group) => ({
            emoji: group.first(),
            count: group.count(),
        }))
        .inflate()
        .orderBy((row) => row.count)
        .tail(50);

    const newEmojiRegex = "(" + emojiCounts.getSeries("emoji").toArray().join("|") + ")";
    const emojiCountsBySender = chatDataWithoutMedia
        .groupBy((row) => row.sender)
        .select((group) => ({
            sender: group.first().sender,
            message: group
                .selectMany((row) => row.message.match(new RegExp(newEmojiRegex, "gu")) || [])
                .deflate()
                .groupBy((emoji) => emoji)
                .select((group) => ({
                    emoji: group.first(),
                    count: group.count(),
                }))
                .inflate(),
        }))
        .inflate()
        .reduce(
            (agg, row) =>
                (agg &&
                    agg.joinOuter(
                        row.message,
                        (inner) => inner.emoji, // inner = agg
                        (outer) => outer.emoji, // outer = row
                        (inner, outer) => ({
                            emoji: inner?.emoji || outer?.emoji, // emoji
                            ...inner, // old senders
                            [row.sender]: outer?.count || 0, // new sender
                        })
                    )) ||
                row.message.renameSeries({ count: row.sender }),
            null
        )
        .generateSeries((row) => ({
            totalCount: Object.keys(row)
                .filter((key) => key !== "emoji")
                .map((sender) => row[sender])
                .reduce((a, b) => a + b, 0),
        }))
        .orderBy((row) => row.totalCount);

    const end = performance.now();

    self.postMessage({
        senders: senders.toArray(),
        emojiCounts: emojiCountsBySender.toArray(),
        time: end - start,
    });
};

export {};
