import type { ISail } from "../../types/Sail";

export const COMMISSION_RATE = 0.6;

export interface CategoryCommission {
  name: string;
  commission: number;
  salesCount: number;
}

export interface WeekSalesPoint {
  label: string;
  sales: number;
  billing: number;
  commission: number;
  isCurrentPeriod: boolean;
}

export interface CommissionStatusTotals {
  paid: number;
  pending: number;
  paidCount: number;
  pendingCount: number;
  total: number;
}

export const parseNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrencyCOP = (value: unknown): string => {
  const amount = parseNumber(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (value: unknown): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value as string | Date);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const calculateCommission = (sale: ISail): number => {
  const backendCommission = parseNumber(sale.refund_price);
  if (backendCommission > 0) return backendCommission;
  return Math.round(parseNumber(sale.category_price) * COMMISSION_RATE);
};

export const getSaleAmount = (sale: ISail): number => parseNumber(sale.category_price);

export const getSaleCategory = (sale: ISail): string => {
  const category = typeof sale.category_bought === "string" ? sale.category_bought.trim() : "";
  return category || "Sin categoría";
};

export const startOfDay = (dateInput: string | Date): Date => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const endOfDay = (dateInput: string | Date): Date => {
  const date = new Date(dateInput);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const filterSalesByDateRange = (
  sales: ISail[],
  start: string,
  end: string
): ISail[] => {
  if (!start || !end) return sales;
  const startTime = startOfDay(start).getTime();
  const endTime = endOfDay(end).getTime();

  return sales.filter((sale) => {
    const saleTime = new Date(sale.created_at).getTime();
    if (Number.isNaN(saleTime)) return false;
    return saleTime >= startTime && saleTime <= endTime;
  });
};

export const groupSalesByCategory = (
  sales: ISail[],
  limit = 6
): CategoryCommission[] => {
  const categoryMap = new Map<string, CategoryCommission>();

  sales.forEach((sale) => {
    const name = getSaleCategory(sale);
    const current = categoryMap.get(name) ?? { name, commission: 0, salesCount: 0 };
    current.commission += calculateCommission(sale);
    current.salesCount += 1;
    categoryMap.set(name, current);
  });

  const sorted = Array.from(categoryMap.values()).sort(
    (a, b) => b.commission - a.commission
  );

  if (sorted.length <= limit) return sorted;

  const topCategories = sorted.slice(0, limit - 1);
  const rest = sorted.slice(limit - 1).reduce<CategoryCommission>(
    (acc, item) => ({
      name: "Otros",
      commission: acc.commission + item.commission,
      salesCount: acc.salesCount + item.salesCount,
    }),
    { name: "Otros", commission: 0, salesCount: 0 }
  );

  return [...topCategories, rest].filter((item) => item.salesCount > 0);
};

export const groupSalesByWeek = (
  sales: ISail[],
  start: Date,
  end: Date
): WeekSalesPoint[] => {
  const weeks: WeekSalesPoint[] = [];
  const today = endOfDay(new Date());
  let current = startOfDay(start);
  const rangeEnd = endOfDay(end);

  while (current.getTime() <= rangeEnd.getTime()) {
    const weekStart = new Date(current);
    const weekEnd = endOfDay(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const cappedWeekEnd = weekEnd.getTime() > rangeEnd.getTime() ? rangeEnd : weekEnd;

    const weekSales = sales.filter((sale) => {
      const saleTime = new Date(sale.created_at).getTime();
      return saleTime >= weekStart.getTime() && saleTime <= cappedWeekEnd.getTime();
    });

    const isCurrentPeriod =
      weekStart.getTime() <= today.getTime() && cappedWeekEnd.getTime() >= today.getTime();

    const point = {
      label: `${formatShortDate(weekStart)} - ${formatShortDate(cappedWeekEnd)}`,
      sales: weekSales.length,
      billing: weekSales.reduce((sum, sale) => sum + getSaleAmount(sale), 0),
      commission: weekSales.reduce((sum, sale) => sum + calculateCommission(sale), 0),
      isCurrentPeriod,
    };

    const isTrailingCurrentPeriodWithoutSales =
      isCurrentPeriod && point.sales === 0 && cappedWeekEnd.getTime() >= today.getTime();

    if (!isTrailingCurrentPeriodWithoutSales || weeks.length === 0) {
      weeks.push(point);
    }

    current = startOfDay(cappedWeekEnd);
    current.setDate(current.getDate() + 1);
  }

  return weeks;
};

export const getCommissionStatusTotals = (sales: ISail[]): CommissionStatusTotals => {
  return sales.reduce<CommissionStatusTotals>(
    (totals, sale) => {
      const commission = calculateCommission(sale);
      totals.total += commission;

      if (sale.is_refund) {
        totals.paid += commission;
        totals.paidCount += 1;
      } else {
        totals.pending += commission;
        totals.pendingCount += 1;
      }

      return totals;
    },
    { paid: 0, pending: 0, paidCount: 0, pendingCount: 0, total: 0 }
  );
};

const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
  }).format(date);
};
