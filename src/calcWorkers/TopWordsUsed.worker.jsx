import * as dataForge from "data-forge";
import moment from "moment";

self.onmessage = (message) => {
    const chatDataWithoutMedia = dataForge.fromJSON(message.data).transformSeries({
        datetime: (datetime) => moment(datetime),
    });

    const senders = chatDataWithoutMedia.getSeries("sender").distinct();

    const wordsBySender = chatDataWithoutMedia
        .groupBy((row) => row.sender)
        .select((group) => ({
            sender: group.first().sender,
            message: group
                .selectMany((row) => row.message.match(/\w+/g) || [])
                .deflate()
                .map((word) => word.toLowerCase())
                .groupBy((word) => word)
                .select((group) => ({
                    word: group.first(),
                    count: group.count(),
                }))
                .inflate()
                .orderByDescending((row) => row.count)
                .setIndex("word"),
        }))
        .inflate()
        .setIndex("sender")
        .bake();

    const wordCounts = chatDataWithoutMedia
        .selectMany((row) => row.message.match(/\w+/g) || [])
        .deflate()
        .map((word) => word.toLowerCase())
        .groupBy((word) => word)
        .select((group) => ({
            word: group.first(),
            count: group.count(),
        }))
        .inflate()
        .orderBy((row) => row.count)
        .tail(100)
        .map((row) => ({
            ...row,
            ...senders.reduce(
                (agg, sender) => ({
                    ...agg,
                    [sender]: wordsBySender.at(sender)?.["message"].at(row.word)?.["count"] || 0,
                }),
                {}
            ),
        }));

    self.postMessage({ senders: senders.toArray(), wordCounts: wordCounts.toArray() });
};

export {};
