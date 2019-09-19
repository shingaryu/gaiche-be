module.exports = {
  YEN: {
    YEN: 1,
    USD: 108.030000,
    EUR: 119.221438
  },
  USD: {
    YEN: 0.009255,
    USD: 1,
    EUR: 1.103800
  },
  EUR: {
    YEN: 0.008382,
    USD: 0.905469,
    EUR: 1
  },
}
// https://info.finance.yahoo.co.jp/fx/convert/
// x YEN = y USD
// y = x * currencyList[USD][YEN]
// x = y * currencyList[YEN][USD]
