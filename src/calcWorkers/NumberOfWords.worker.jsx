import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Description of the calculation.
 * @param {import("data-forge").DataFrame} chatDataWithoutMedia
 * @returns
 */
function workerExecute(chatDataWithoutMedia) {
    const senders = chatDataWithoutMedia.getSeries("sender").distinct().toArray();

    const totalWords = chatDataWithoutMedia.getSeries("wordCount").sum();
    const totalWordsBySender = {
        name: "words",
        children: senders.map((sender) => ({
            name: sender,
            count: chatDataWithoutMedia
                .where((row) => row.sender === sender)
                .getSeries("wordCount")
                .sum(),
        })),
    };

    const distinctWords = chatDataWithoutMedia
        .selectMany((row) => row.message.match(/\p{L}+/gu) || [])
        .deflate()
        .distinct((word) => word.toLowerCase())
        .count();
    const distinctWordsBySender = {
        name: "distinct words",
        children: senders.map((sender) => ({
            name: sender,
            count: chatDataWithoutMedia
                .where((row) => row.sender === sender)
                .selectMany((row) => row.message.match(/\p{L}+/gu) || [])
                .deflate()
                .distinct((word) => word.toLowerCase())
                .count(),
        })),
    };

    return {
        totalWords: totalWords,
        totalWordsBySender: totalWordsBySender,
        distinctWords: distinctWords,
        distinctWordsBySender: distinctWordsBySender,
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
