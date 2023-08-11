import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Worker that takes a string and converts it to a usable format.
 * @param {*} message
 */

self.onmessage = (message) => {
    const mediaExcludedPhrase = ["<Medien ausgeschlossen>", "<Media omitted>"];
    const messageSplitRegex =
        /\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}[\s\S]*?(?=\n\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2})/gm;
    const messageReadRegex = /(\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}) - (.*?): ([\s\S]*)/;
    const serviceMessageReadRegex = /(\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}) - ([\s\S]*)/;
    const timeFormat = "DD.MM.YY, HH:mm";

    const text = message.data;

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
                wordCount: groups[3].split(" ").length,
            };

        groups = row.match(serviceMessageReadRegex);
        return {
            datetime: moment(groups[1], timeFormat),
            sender: "WhatsApp",
            message: groups[2],
            messageLength: groups[2].length,
            wordCount: groups[2].split(" ").length,
        };
    });

    self.postMessage({
        chatData: df.toJSON(),
        chatDataWithoutMedia: df
            .where((row) => !mediaExcludedPhrase.includes(row.message))
            .toJSON(),
    });
    console.log("Done parsing");
};

export {};
