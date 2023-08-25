import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Calculates the longest message for each sender.
 * @param {import("data-forge").DataFrame} chatDataWithoutMedia 
 * @returns 
 */
function workerExecute(chatDataWithoutMedia) {
    const senders = chatDataWithoutMedia.getSeries("sender").distinct();

    const longestMessagesBySender = chatDataWithoutMedia
        .groupBy((row) => row.sender)
        .select((group) =>
            group.aggregate(group.first(), (agg, row) =>
                agg.messageLength < row.messageLength ? row : agg
            )
        )
        .inflate()
        .orderByDescending((row) => row.messageLength);

    return {
        senders: senders.toArray(),
        longestMessagesBySender: longestMessagesBySender
            .transformSeries({
                datetime: (datetime) => datetime.format(),
            })
            .toArray(),
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
