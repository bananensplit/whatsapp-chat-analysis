import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Calculates the number of messages for each sender for each hour of the day.
 * @param {import("data-forge").DataFrame} chatData 
 * @returns 
 */
function workerExecute(chatData) {
    const senders = chatData.getSeries("sender").distinct();

    const messageCount = chatData
        .withSeries("hour", (df) => df.getSeries("datetime").map((e) => moment(e).hour()))
        .pivot(["sender", "hour"], { message: (message) => message.count() })
        .groupBy((row) => row.hour)
        .map((group) => ({
            hour: group.first().hour,
            ...group.toObject(
                (row) => row.sender,
                (row) => row.message
            ),
        }))
        .insertPair([0, { hour: -1 }])
        .appendPair([23, { hour: 24 }])
        .fillGaps(
            (row1, row2) => row1[1].hour + 1 !== row2[1].hour,
            (row1, row2) =>
                [...Array(row2[1].hour - row1[1].hour - 1).keys()].map((e) => [
                    row1[1].hour + e + 1,
                    { hour: row1[1].hour + e + 1 },
                ])
        )
        .skip(1)
        .head(24);

    return { senders: senders.toArray(), messageCount: messageCount.toArray() };
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
