import * as dataForge from "data-forge";
import moment from "moment";

self.onmessage = (message) => {
    const chatData = dataForge.fromJSON(message.data).transformSeries({
        datetime: (datetime) => moment(datetime),
    });

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

    self.postMessage({ senders: senders.toArray(), messageCount: messageCount.toArray() });
};

export {};
