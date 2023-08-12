import * as dataForge from "data-forge";
import moment from "moment";

self.onmessage = (message) => {
    const start = performance.now();
    const chatDataWithoutMedia = dataForge.fromJSON(message.data).transformSeries({
        datetime: (datetime) => moment(datetime),
    });

    const senders = chatDataWithoutMedia.getSeries("sender").distinct();

    const charCounts = chatDataWithoutMedia
        .groupBy((row) => row.sender)
        .select((group) => ({
            sender: group.first().sender,
            message: group
                .selectMany((row) => row.message.toLowerCase().match(/\p{L}/gu) || [])
                .deflate()
                .groupBy((char) => char)
                .select((group) => ({
                    char: group.first(),
                    count: group.count(),
                }))
                .inflate()
                .bake()
        }))
        .inflate()
        .reduce(
            (agg, row) =>
                (agg &&
                    agg.joinOuter(
                        row.message,
                        (inner) => inner.char, // inner = agg
                        (outer) => outer.char, // outer = row
                        (inner, outer) => ({
                            char: inner?.char || outer?.char, // char
                            ...inner, // old senders
                            [row.sender]: outer?.count || 0, // new sender
                        })
                    )) ||
                row.message.renameSeries({ count: row.sender }),
            null
        )
        .generateSeries((row) => ({
                totalCount: Object.keys(row)
                    .filter((key) => key !== "char")
                    .map((sender) => row[sender])
                    .reduce((a, b) => a + b, 0),
        }))
        .orderBy(row => row.totalCount)
        .tail(50);

    console.log("charCounts");
    console.log(charCounts.toArray());
    console.log(charCounts.toString());

    const end = performance.now();

    self.postMessage({
        senders: senders.toArray(),
        charCounts: charCounts.toArray(),
        time: end - start,
    });
};

export {};
