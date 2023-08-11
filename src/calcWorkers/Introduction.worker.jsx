import * as dataForge from "data-forge";
import moment from "moment";

self.onmessage = (message) => {
    const mediaExcludedPhrase = ["<Medien ausgeschlossen>", "<Media omitted>"];

    const chatData = dataForge.fromJSON(message.data.chatData).transformSeries({
        datetime: (datetime) => moment(datetime),
    });
    const chatDataWithoutMedia = dataForge
        .fromJSON(message.data.chatDataWithoutMedia)
        .transformSeries({
            datetime: (datetime) => moment(datetime),
        });

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

    const wordCounts = {
        name: "words",
        children: senders.map((sender) => ({
            name: sender,
            count: chatDataWithoutMedia
                .where((row) => row.sender === sender)
                .getSeries("wordCount")
                .sum(),
        })),
    };

    const charCounts = {
        name: "chars",
        children: senders.map((sender) => ({
            name: sender,
            count: chatDataWithoutMedia
                .where((row) => row.sender === sender)
                .getSeries("messageLength")
                .sum(),
        })),
    };

    self.postMessage({
        senders: senders,
        messageCounts: messageCounts,
        wordCounts: wordCounts,
        charCounts: charCounts,
    });
};

export {};
