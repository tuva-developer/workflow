export type CronLocaleFns = {
  [k: string]: ((...a: (string | number)[]) => string) | boolean;
};

const vi: CronLocaleFns = {
  use24HourTimeFormatByDefault: true,
  anErrorOccuredWhenGeneratingTheExpressionD: () => "Biểu thức cron không hợp lệ",

  everyMinute: () => "Mỗi phút",
  everyHour: () => "Mỗi giờ",
  everyDay: () => "Mỗi ngày",
  everyX0Days: (x) => `Mỗi ${x} ngày`,
  everyX0Minutes: (x) => `Mỗi ${x} phút`,
  everyX0Hours: (x) => `Mỗi ${x} giờ`,
  everyX0Seconds: (x) => `Mỗi ${x} giây`,

  atX0: (x) => `Lúc ${x}`,
  atX0MinutesPastTheHour: (x) => `Vào phút ${x}`,
  atX0SecondsPastTheMinute: (x) => `Vào giây ${x}`,
  betweenX0AndX1: (a, b) => `Từ ${a} đến ${b}`,

  daysOfTheWeek: () => "Ngày trong tuần",
  daysOfTheMonth: () => "Ngày trong tháng",
  onlyOnX0: (x) => `Chỉ vào ${x}`,
  onlyInX0: (x) => `Chỉ trong ${x}`,
  onThe: () => "Vào",
  onTheLastDayOfTheMonth: () => "Vào ngày cuối cùng của tháng",
  onTheLastWeekdayOfTheMonth: () => "Vào ngày làm việc cuối cùng của tháng",
  onTheLastX0OfTheMonth: (x) => `Vào ${x} cuối cùng của tháng`,
  onTheX0OfTheMonth: (x) => `Vào ${x} của tháng`,
  everyX0Months: (x) => `Mỗi ${x} tháng`,
  everyX0MonthsOnTheX1: (x, y) => `Mỗi ${x} tháng vào ${y}`,

  commaEveryX0Days: (x) => `, mỗi ${x} ngày`,
  commaEveryX0Minutes: (x) => `, mỗi ${x} phút`,
  commaEveryX0Months: (x) => `, mỗi ${x} tháng`,
  commaEveryX0Hours: (x) => `, mỗi ${x} giờ`,
  commaOnTheX0OfTheMonth: (x) => `, vào ${x} của tháng`,
  commaOnTheLastX0OfTheMonth: (x) => `, vào ${x} cuối cùng của tháng`,
  commaOnlyOnX0: (x) => `, chỉ vào ${x}`,
  commaOnlyInX0: (x) => `, chỉ trong ${x}`,
  commaAndOnX0: (x) => `, và vào ${x}`,
  commaAndOnTheX0OfTheMonth: (x) => `, và vào ${x} của tháng`,
  commaOnTheLastDayOfTheMonth: () => `, vào ngày cuối cùng của tháng`,
  commaOnTheLastWeekdayOfTheMonth: () => `, vào ngày làm việc cuối cùng của tháng`,

  first: () => "đầu tiên",
  second: () => "thứ hai",
  third: () => "thứ ba",
  fourth: () => "thứ tư",
  fifth: () => "thứ năm",
  timePm: () => "chiều",
  timeAm: () => "sáng",

  monday: () => "Thứ Hai",
  tuesday: () => "Thứ Ba",
  wednesday: () => "Thứ Tư",
  thursday: () => "Thứ Năm",
  friday: () => "Thứ Sáu",
  saturday: () => "Thứ Bảy",
  sunday: () => "Chủ Nhật",

  january: () => "Tháng Một",
  february: () => "Tháng Hai",
  march: () => "Tháng Ba",
  april: () => "Tháng Tư",
  may: () => "Tháng Năm",
  june: () => "Tháng Sáu",
  july: () => "Tháng Bảy",
  august: () => "Tháng Tám",
  september: () => "Tháng Chín",
  october: () => "Tháng Mười",
  november: () => "Tháng Mười Một",
  december: () => "Tháng Mười Hai",
};

export default vi;