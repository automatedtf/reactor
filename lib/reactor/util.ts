import { TradeItem, TradeOffer } from "@automatedtf/slate";

export function serialiseData(data: any) {
  if (data == null) return null;
  if (typeof data === "string") return data;

  const dataCopy = { ...data };
  if (dataCopy.offer && dataCopy.offer._manager) delete dataCopy.offer._manager;
  return dataCopy;
}

type UpdatedEconItem = TradeItem & {
  new_assetid: string;
  new_contextid: string;
  rollback_new_assetid: string;
  rollback_new_contextid: string;
};

export type AcceptedTradeOffer = Omit<
  TradeOffer,
  "itemsToReceive" | "itemsToGive"
> & {
  itemsToReceive: UpdatedEconItem[];
  itemsToGive: UpdatedEconItem[];
};

export function populateExchangeDetails(
  offer: TradeOffer & { getExchangeDetails: any }
): Promise<AcceptedTradeOffer> {
  return new Promise((resolve, reject) => {
    offer.getExchangeDetails(
      false,
      (
        err,
        status,
        tradeInitTime,
        receivedItems: UpdatedEconItem[],
        sentItems: UpdatedEconItem[]
      ) => {
        if (err) return reject(err);

        const receivedItemsDict = receivedItems.reduce((acc, item) => {
          acc[item.assetid] = item;
          return acc;
        }, {} as { [id: string]: UpdatedEconItem });
        offer.itemsToReceive = offer.itemsToReceive.map((item) => ({
          ...item,
          ...receivedItemsDict[item.assetid],
        }));

        const sentItemsDict = sentItems.reduce((acc, item) => {
          acc[item.assetid] = item;
          return acc;
        }, {} as { [id: string]: UpdatedEconItem });
        offer.itemsToGive = offer.itemsToGive.map((item) => ({
          ...item,
          ...sentItemsDict[item.assetid],
        }));

        resolve(offer as any as AcceptedTradeOffer);
      }
    );
  });
}
