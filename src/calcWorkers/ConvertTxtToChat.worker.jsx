import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Takes a string formatted as a WhatsApp chat export and converts it to a dataForge DataFrame.
 * It returns one DataFrame with all messages and one without media messages.
 * @param {string} text String formatted as a WhatsApp chat export
 * @returns
 */
function workerExecute(text) {
    const mediaExcludedPhrase = ["<Medien ausgeschlossen>", "<Media omitted>"];
    const messageSplitRegex =
        /\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}[\s\S]*?(?=\n\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2})/gm;
    const messageReadRegex = /(\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}) - (.*?): ([\s\S]*)/;
    const serviceMessageReadRegex = /(\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}) - ([\s\S]*)/;
    const timeFormat = "DD.MM.YY, HH:mm";

    let df = new dataForge.DataFrame({
        considerAllRows: true,
        columnNames: ["rawmessage"],
        rows: [...text.matchAll(messageSplitRegex)].map((row) => [row[0].replace("\r", "")]),
    });

    df = df.inflateSeries("rawmessage", (row) => {
        let groups = row.match(messageReadRegex);
        if (groups !== null)
            return {
                datetime: moment(groups[1], timeFormat),
                sender: groups[2],
                message: groups[3],
                messageLength: groups[3].length,
                wordCount: (groups[3].match(/\p{L}+/gu) || []).length,
            };

        groups = row.match(serviceMessageReadRegex);
        return {
            datetime: moment(groups[1], timeFormat),
            sender: "WhatsApp",
            message: groups[2],
            messageLength: groups[2].length,
            wordCount: (groups[2].match(/\p{L}+/gu) || []).length,
        };
    });

    return {
        chatData: df.toJSON(),
        chatDataWithoutMedia: df
            .where((row) => !mediaExcludedPhrase.includes(row.message))
            .toJSON(),
    };
}

self.onmessage = (message) => {
    const start = performance.now();
    const result = workerExecute(message.data);
    const end = performance.now();

    self.postMessage({
        ...result,
        time: end - start,
    });
};

export {};
