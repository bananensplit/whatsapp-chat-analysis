import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Calculates the number of messages for each sender for each day of the week.
 * @param {import("data-forge").DataFrame} chatData 
 * @returns 
 */
function workerExecute(chatData) {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const senders = chatData.getSeries("sender").distinct();

    const messageCount = chatData
        .withSeries("day", (df) => df.getSeries("datetime").map((e) => e.isoWeekday()))
        .pivot(["sender", "day"], { message: (message) => message.count() })
        .groupBy((row) => row.day)
        .map((group) => ({
            day: weekdays[group.first().day - 1],
            ...group.toObject(
                (row) => row.sender,
                (row) => row.message
            ),
        }));

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
