import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Calculates the top 100 words used in the chat and the determines the number of usages by each sender.
 * @param {import("data-forge").DataFrame} chatDataWithoutMedia
 * @returns
 */
function workerExecute(chatDataWithoutMedia) {
    const senders = chatDataWithoutMedia.getSeries("sender").distinct();

    const wordsBySender = chatDataWithoutMedia
        .groupBy((row) => row.sender)
        .select((group) => ({
            sender: group.first().sender,
            message: group
                .selectMany((row) => row.message.match(/\p{L}+/gu) || [])
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
        .selectMany((row) => row.message.match(/\p{L}+/gu) || [])
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

    return {
        senders: senders.toArray(),
        wordCounts: wordCounts.toArray(),
    };
}

self.onmessage = (message) => {
    const start = performance.now();

    const chatDataWithoutMedia = dataForge
        .fromJSON(message.data.chatDataWithoutMedia)
        .transformSeries({
            datetime: (datetime) => moment(datetime),
        });

    const result = workerExecute(chatDataWithoutMedia);
    const end = performance.now();

    self.postMessage({
        ...result,
        time: end - start,
    });
};

export {};
