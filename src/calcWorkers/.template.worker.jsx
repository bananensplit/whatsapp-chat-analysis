import * as dataForge from "data-forge";
import moment from "moment";

/**
 * Description of the calculation.
 * @param {import("data-forge").DataFrame} chatData 
 * @param {import("data-forge").DataFrame} chatDataWithoutMedia 
 * @returns 
 */
function workerExecute(chatData, chatDataWithoutMedia) {
    // calculation of the result
    return {};
}

self.onmessage = (message) => {
    const start = performance.now();

    const chatData = dataForge.fromJSON(message.data.chatData).transformSeries({
        datetime: (datetime) => moment(datetime),
    });
    const chatDataWithoutMedia = dataForge
        .fromJSON(message.data.chatDataWithoutMedia)
        .transformSeries({
            datetime: (datetime) => moment(datetime),
        });

    const result = workerExecute(chatData, chatDataWithoutMedia);
    const end = performance.now();

    self.postMessage({
        ...result,
        time: end - start,
    });
};

export {};
