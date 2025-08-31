import { requestGet, requestPost } from "../lib/request";
import { getCookie, setCookie } from "../lib/storage";


export const login = async (username: string, password: string, totp: string): Promise<{ status: boolean, message: string }> => {

    const data: any = await requestPost("/api/login", {
        username: "199710262023211003",
        password: "Qwerty12345@",
        totp: "897883"
    });

    if (!data?.token) {
        return {
            status: false,
            message: data?.message
        }
    }

    setCookie("token", data?.token)
    return {
        status: true,
        message: "Berhasil login"
    }
}

export const resume = async (): Promise<{
    status: boolean,
    message?: string,
    data: {
        PAGI: string,
        SIANG: string,
        SORE: string,
    }
}> => {
    const token = getCookie("token");
    const data: any = await requestGet("/api/resume", "token", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!data?.data) {
        return {
            status: false,
            message: data?.message,
            data: {
                PAGI: "",
                SIANG: "",
                SORE: "",
            }
        }
    }
    const result = {
        PAGI: data?.data?.PAGI,
        SIANG: data?.data?.SIANG,
        SORE: data?.data?.SORE,
    }

    return {
        status: true,
        data: result
    }
}


type Riwayat = {
    device: string //'Android',
    itgl: string //'1/8/2025',
    jam: string //'07:44:51',
    WF: string //'WFO',
    check: string //'Pagi'
}

export const riwayat = async (): Promise<{
    status: boolean,
    message?: string,
    data: Riwayat[]
}> => {
    const token = getCookie("token");
    const data: any = await requestGet("/api/riwayat", "token", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!data?.data) {
        return {
            status: false,
            message: data?.message,
            data: []
        }
    }

    return {
        status: true,
        data: data?.data
    }
}


export const faceverification = async (image: string): Promise<{
    status: boolean,
    message?: string,
}> => {
    const token = getCookie("token");
    // const image = ""
    const data: any = await requestPost("/api/faceverification", { image: image }, "token", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!data?.data) {
        return {
            status: false,
            message: data?.message,
        }
    }

    return {
        status: true,
    }
}


export const presensi = async (image: string): Promise<{
    status: boolean,
    message?: string,
}> => {
    const token = getCookie("token");

    const payload = {
        timezone: "Asia/Jakarta",
        workfrom: 1
    };

    // const image = ""
    const data: any = await requestPost("/api/presensi", payload, "token", {
        headers: {
            Authorization: "Bearer " + token,
        },
    });
    if (!data?.data) {
        return {
            status: false,
            message: data?.message,
        }
    }

    return {
        status: true,
        message: "berhasil"
    }
}