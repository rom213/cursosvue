// src/services/RefundService.ts
import type { AxiosResponse } from "axios";
import ApiService from "./ApiService";
import type {
  IApiResponseAccount,
  IApiResponseBalance,
  IApiResponsePendingRefunds,
  IApiResponseRefer,
  IApiResponseRefund,
  IApiResponseVoid,
} from "../types/admin/ReferAdmin";

export class AdminRefundService {
  static async getSearchRefunds(
    date_init: Date,
    date_end: Date,
    search: string = "",
    page: number = 1,
    per_page: number = 10
  ): Promise<IApiResponseRefund> {
    try {
      const formattedDateInit = date_init.toISOString().split("T")[0];
      const formattedDateEnd = date_end.toISOString().split("T")[0];
      const params = new URLSearchParams({
        date_init: formattedDateInit,
        date_end: formattedDateEnd,
        page: page.toString(),
        per_page: per_page.toString(),
      });
      if (search.trim()) {
        params.append("search", search.trim());
      }

      const url = `/api/managment/refunds?${params.toString()}`;
      const response: AxiosResponse<IApiResponseRefund> =
        await ApiService.get<IApiResponseRefund>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseRefund = {
        message: "Error al obtener reembolsos",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error("Error obteniendo los reintegros:", error);
      return res;
    }
  }

  static async getAllRefundsByGoogleId(
    googleId: string,
    date_init: Date,
    date_end: Date
  ): Promise<IApiResponseRefund> {
    try {
      const formattedDateInit = date_init.toISOString().split("T")[0];
      const formattedDateEnd = date_end.toISOString().split("T")[0];
      const url = `/api/managment/refunds/${googleId}?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;
      const response: AxiosResponse<IApiResponseRefund> =
        await ApiService.get<IApiResponseRefund>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseRefund = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async getRefund(refundId: string): Promise<IApiResponseRefund> {
    try {
      const url = `/api/managment/refund/${refundId}`;
      const response: AxiosResponse<IApiResponseRefund> =
        await ApiService.get<IApiResponseRefund>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseRefund = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async getBalance(
    googleId: string,
    date_init: Date,
    date_end: Date
  ): Promise<IApiResponseBalance> {
    try {
      const formattedDateInit = date_init.toISOString().split("T")[0];
      const formattedDateEnd = date_end.toISOString().split("T")[0];
      const url = `/api/balance/${googleId}?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;
      const response: AxiosResponse<IApiResponseBalance> =
        await ApiService.get<IApiResponseBalance>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseBalance = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async gen(): Promise<IApiResponseVoid> {
    try {
      const url = `/api/auth/request-verification-code`;
      const response: AxiosResponse<IApiResponseVoid> =
        await ApiService.post<IApiResponseVoid>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseVoid = {
        message: "",
        records: [],
        status: "error",
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async createRefund(form: FormData): Promise<IApiResponseRefund> {
    try {
      const url = `/api/managment/mass-payment`;

      // OPCIÓN A: Si tu ApiService es un wrapper directo de Axios
      const response: AxiosResponse<IApiResponseRefund> =
        await ApiService.postForm<IApiResponseRefund>(url, form);

      return response.data;
    } catch (error) {
      const res: IApiResponseRefund = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async getAccountByGoogleId(
    googleId: string
  ): Promise<IApiResponseAccount> {
    try {
      const url = `/user/accounts/${googleId}`;
      const response: AxiosResponse<IApiResponseAccount> =
        await ApiService.get<IApiResponseAccount>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseAccount = {
        message: "",
        records: { 0: [] },
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async getUsersWithOutPay(
    page: number = 1,
    per_page: number = 10
  ): Promise<IApiResponsePendingRefunds> {
    try {
      const url = `/api/managment/users/pending-refunds?page=${page}&per_page=${per_page}`;
      const response: AxiosResponse<IApiResponsePendingRefunds> =
        await ApiService.get<IApiResponsePendingRefunds>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponsePendingRefunds = {
        message: "",
        records: { 0: [] },
        status: "error",
        pagination: null,
      };
      console.error("error", error);
      return res;
    }
  }
}

export class AdminReferService {
  static async getAllReferWithOutPay(
    date_init: Date,
    date_end: Date
  ): Promise<IApiResponseRefer> {
    try {
      const formattedDateInit = date_init.toISOString().split("T")[0];
      const formattedDateEnd = date_end.toISOString().split("T")[0];
      const url = `/api/managment/refers/unpaid?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;
      const response: AxiosResponse<IApiResponseRefer> =
        await ApiService.get<IApiResponseRefer>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseRefer = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async getAllReferWithOutPayByGoogle(
    google_id: string,
    date_init: Date,
    date_end: Date
  ): Promise<IApiResponseRefer> {
    try {
      const formattedDateInit = date_init.toISOString().split("T")[0];
      const formattedDateEnd = date_end.toISOString().split("T")[0];
      const url = `/api/managment/refers/unpaid/${google_id}?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;
      const response: AxiosResponse<IApiResponseRefer> =
        await ApiService.get<IApiResponseRefer>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseRefer = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async getAllReferWithPay(
    date_init: Date,
    date_end: Date
  ): Promise<IApiResponseRefer> {
    try {
      const formattedDateInit = date_init.toISOString().split("T")[0];
      const formattedDateEnd = date_end.toISOString().split("T")[0];
      const url = `/api/managment/refers/paid?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;
      const response: AxiosResponse<IApiResponseRefer> =
        await ApiService.get<IApiResponseRefer>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseRefer = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }

  static async getAllReferWithPayByGoogleId(
    google_id: string,
    date_init: Date,
    date_end: Date
  ): Promise<IApiResponseRefer> {
    try {
      const formattedDateInit = date_init.toISOString().split("T")[0];
      const formattedDateEnd = date_end.toISOString().split("T")[0];
      const url = `/api/managment/refers/paid/${google_id}?date_init=${formattedDateInit}&date_end=${formattedDateEnd}`;
      const response: AxiosResponse<IApiResponseRefer> =
        await ApiService.get<IApiResponseRefer>(url);
      return response.data;
    } catch (error) {
      const res: IApiResponseRefer = {
        message: "",
        records: [],
        status: "ERROR",
        pagination: null,
      };
      console.error(
        "Error obteniendo los reintegros por usuario y fecha:",
        error
      );
      return res;
    }
  }
}
