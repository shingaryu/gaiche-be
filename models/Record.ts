type Record = {
  id: string,
  userId: string | null,
  date: string,
  transactionCategory: number,
  transactionFrom: string,
  transactionTo: string | null,
  amount: number,
  currency: string,
  category1: string,
  category2: string | null,
  shop: string,
  memo: string | null
}

export default Record;