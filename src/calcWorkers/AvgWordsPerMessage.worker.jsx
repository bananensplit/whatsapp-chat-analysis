import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Description of the calculation.
 * @param {import("data-forge").DataFrame} chatDataWithoutMedia
 * @returns
 */
function workerExecute(chatDataWithoutMedia) {
    const sender = chatDataWithoutMedia.getSeries("sender").distinct();

    const totalAvgWordsPerMessage = chatDataWithoutMedia
        .getSeries("wordCount")
        .average()
        .toFixed(2);

    const avgWordsPerMessage = chatDataWithoutMedia
        .filter((row) => row.wordCount > 1)
        .groupBy((row) => row.sender)
        .select((group) => ({
            sender: group.first().sender,
            avgWordsPerMessage: group
                .groupBy((row) => row.datetime.hour())
                .select((group) => ({
                    hour: group.first().datetime.hour(),
                    avgWordsPerMessage: group.getSeries("wordCount").average().toFixed(2),
                }))
                .inflate(),
        }))
        .inflate()
        .reduce(
            (acc, row) =>
                acc.joinOuter(
                    row.avgWordsPerMessage,
                    (inner) => inner.hour, // inner = agg
                    (outer) => outer.hour, // outer = row
                    (inner, outer) => ({
                        ...inner,
                        [row.sender]: outer?.avgWordsPerMessage || 0,
                    })
                ),
            new dataForge.DataFrame({
                columnNames: ["hour"],
                rows: [...Array(24).keys()].map((e) => [e]),
            })
        );

    return {
        sender: sender.toArray(),
        totalAvgWordsPerMessage: totalAvgWordsPerMessage,
        avgWordsPerMessage: avgWordsPerMessage.toArray(),
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
