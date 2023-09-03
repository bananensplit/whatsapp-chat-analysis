import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Description of the calculation.
 * @param {import("data-forge").DataFrame} chatDataWithoutMedia
 * @returns
 */
function workerExecute(chatDataWithoutMedia) {
    const totalCharsBySender = chatDataWithoutMedia
        .groupBy((message) => message.sender)
        .select((group) => ({
            sender: group.first().sender,
            charCount: group
                .getSeries("message")
                .map((message) => message.length)
                .sum(),
        }))
        .inflate();

    const totalChars = totalCharsBySender.getSeries("charCount").sum();

    return {
        totalChars: totalChars,
        totalCharsBySender: {
            name: "chars",
            children: totalCharsBySender
                .renameSeries({ sender: "name", charCount: "count" })
                .toArray(),
        },
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
