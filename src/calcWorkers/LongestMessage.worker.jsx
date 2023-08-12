import * as dataForge from "data-forge";
import moment from "moment";

self.onmessage = (message) => {
    const chatDataWithoutMedia = dataForge.fromJSON(message.data).transformSeries({
        datetime: (datetime) => moment(datetime),
    });

    const senders = chatDataWithoutMedia.getSeries("sender").distinct();

    const longestMessagesBySender = chatDataWithoutMedia
        .groupBy((row) => row.sender)
        .select((group) =>
            group.aggregate(chatDataWithoutMedia.first(), (agg, row) =>
                agg.messageLength < row.messageLength ? row : agg
            )
        )
        .inflate();

    self.postMessage({
        senders: senders.toArray(),
        longestMessagesBySender: longestMessagesBySender.transformSeries({
            datetime: (datetime) => datetime.format(),
        }).toArray(),
    });
};

export {};
