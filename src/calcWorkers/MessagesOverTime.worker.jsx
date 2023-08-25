import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Description of the calculation.
 * @param {import("data-forge").DataFrame} chatData
 * @returns
 */
function workerExecute(chatData) {
    const messagesOverTime = chatData
        .groupBy((row) => row.datetime.format("YYYY-MM-DD"))
        // .groupBy((row) => row.datetime.format("ww-YYYY"))
        .select((group) => ({
            datetime: group.first().datetime,
            count: group.count(),
        }))
        .inflate()
        .transformSeries({ datetime: (datetime) => datetime.format("YYYY-MM-DD") })
        .renameSeries({ datetime: "x", count: "y" });

    let tempVar = 0;
    const cumMessagesOverTime =  chatData
        .groupBy((row) => row.datetime.format("YYYY-MM-DD"))
        // .groupBy((row) => row.datetime.format("ww-YYYY"))
        .select((group) => ({
            datetime: group.first().datetime,
            count: group.count(),
        }))
        .inflate()
        .transformSeries({ count: (count) => (tempVar += count) })
        .transformSeries({ datetime: (datetime) => datetime.format("YYYY-MM-DD") })
        .renameSeries({ datetime: "x", count: "y" });


    return {
        messagesOverTime: [{ id: "messages", data: messagesOverTime.toArray() }],
        cumMessagesOverTime: [{ id: "messages", data: cumMessagesOverTime.toArray() }]
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
