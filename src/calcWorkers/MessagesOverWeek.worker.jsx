import * as dataForge from "data-forge";
import moment from "moment";

self.onmessage = (message) => {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const chatData = dataForge.fromJSON(message.data).transformSeries({
        datetime: (datetime) => moment(datetime),
    });

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

    self.postMessage({ senders: senders.toArray(), messageCount: messageCount.toArray() });
};

export {};
