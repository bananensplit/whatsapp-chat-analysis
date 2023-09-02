import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Description of the calculation.
 * @param {import("data-forge").DataFrame} chatData 
 * @returns 
 */
function workerExecute(chatData) {
    const mediaExcludedPhrase = ["<Medien ausgeschlossen>", "<Media omitted>"];
    const senders = chatData.getSeries("sender").distinct().toArray();

    const messageCounts = {
        name: "messages",
        children: senders.map((sender) => ({
            name: sender,
            children: [
                {
                    name: sender + " - text messages",
                    count: chatData
                        .where(
                            (row) =>
                                row.sender === sender && !mediaExcludedPhrase.includes(row.message)
                        )
                        .count(),
                },
                {
                    name: sender + " - media messages",
                    count: chatData
                        .where(
                            (row) =>
                                row.sender === sender && mediaExcludedPhrase.includes(row.message)
                        )
                        .count(),
                },
            ],
        })),
    };

    return {
        totalMessages: chatData.count(),
        totalMessagesBySender: messageCounts
    };
}

self.onmessage = (message) => {
    const start = performance.now();

    const chatData = dataForge.fromJSON(message.data.chatData).transformSeries({
        datetime: (datetime) => moment(datetime),
    });

    const result = workerExecute(chatData);
    const end = performance.now();

    self.postMessage({
        ...result,
        time: end - start,
    });
};

export {};
