import type { APIRoute } from 'astro';
import { HTTPResponse, requestGet, requestPost } from '../../lib/request';
import { getTimeRangeResult } from '../../lib/time';

type Handler = (req: Request, params: Record<string, string>) => Promise<Response> | Response;

// Router map: key = "METHOD:/path", value = handler function
const routes = new Map<string, Handler>();

const API_URL = import.meta.env.API_URL


// Register route POST /api/echo
routes.set('GET:/', async (req) => {
    return HTTPResponse({
        status: 200,
        message: "selamat data"
    })
});

// Register route GET /api/hello
routes.set('POST:/login', async (req) => {
    const { username, password, totp } = await req.json();
    const payload = {
        u: username,
        p: password,
        otp: totp,
        d: '4ndr01d-0pt1mu5-p121m3',
        'ph-id': '49b956bf737edce5',
        'ph-type': 'GSM',
        'ph-manufacturer': 'Xiaomi',
        'ph-model': '24069PC21G',
        'ph-product': 'peridot_global'
    };
    const pre: any = await requestPost(API_URL + "/login", payload)
    if (!pre?.session_id) {
        return new Response(JSON.stringify({ message: pre?.message || 'username, password, otp tidak cocok' }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const token = pre?.session_id
    return new Response(JSON.stringify({ message: 'Hello from GET /hello', token: token }), {
        headers: { 'Content-Type': 'application/json' },
    });
});


routes.set('GET:/resume', async (req) => {

    const auth = req.headers.get('authorization');
    let bearerToken: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
        bearerToken = auth.slice(7);
    }
    if (!bearerToken) {
        return HTTPResponse({
            status: 401, message: "Invalid token"
        })
    }

    const data: any = await requestGet(API_URL + "/resume", "lbp_presence=" + bearerToken)
    if (!data?.data) {
        return HTTPResponse({
            status: 400, message: data?.message || "Bad Request"
        })
    }

    return HTTPResponse({
        status: 200, message: "Berhasil get data", data: {
            "PAGI": data?.data?.PAGI,
            "SIANG": data?.data?.SIANG,
            "SORE": data?.data?.SORE,
        }
    })
});


routes.set('GET:/riwayat', async (req) => {

    const auth = req.headers.get('authorization');
    let bearerToken: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
        bearerToken = auth.slice(7);
    }
    if (!bearerToken) {
        return HTTPResponse({
            status: 401, message: "Invalid token"
        })
    }

    const date = new Date()
    const bulan = date.getMonth() + 1
    const tahun = date.getFullYear()

    const data: any = await requestGet(API_URL + "/transactionlog?bulan=" + bulan + "&tahun=" + tahun, "lbp_presence=" + bearerToken)
    if (data?.status != '1') {
        return HTTPResponse({
            status: 400, message: data?.message || "Bad Request"
        })
    }


    return HTTPResponse({
        status: 200, message: "Berhasil get data", data: data?.data
    })
});


routes.set('POST:/faceverification', async (req) => {

    const auth = req.headers.get('authorization');
    let bearerToken: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
        bearerToken = auth.slice(7);
    }
    if (!bearerToken) {
        return HTTPResponse({
            status: 401, message: "Invalid token"
        })
    }

    const { image } = await req.json();
    console.log("image", image)

    // const data:any = await requestPost(API_URL + "/faceverification", {"img": image}, "lbp_presence="+bearerToken)
    // if(data?.status != '1'){
    //     return HTTPResponse({
    //         status: 400, message: data?.message || "Bad Request"
    //     })
    // }


    return HTTPResponse({
        status: 200, message: "Berhasil get data", data: ""
    })
});


routes.set('POST:/presensi', async (req) => {

    const auth = req.headers.get('authorization');
    let bearerToken: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
        bearerToken = auth.slice(7);
    }
    if (!bearerToken) {
        return HTTPResponse({
            status: 401, message: "Invalid token"
        })
    }

    const { workfrom, timezone } = await req.json();

    if(parseInt(workfrom) != 0 && parseInt(workfrom) != 1){
        return HTTPResponse({
            status: 400, message: "Pilih kerja dari mana"
        })
    }

    const payload = {
        "timezone": timezone || "Asia/Jakarta",
        "latt": "",
        "lng": "",
        "workfrom": workfrom, // 0 || 1
        "checkintype": getTimeRangeResult(), // 1, // 0 - 2
        "address": "",
        "kesehatan": "sehat",
        "devicetype": "0",
        "accu": 0,
        "ph-id": "pegawai!.ph_id",
        "ph-type": "pegawai!.ph_type,",
        "ph-manufacturer": "pegawai!.ph_manufacturer",
        "ph-model": "pegawai!.ph_model",
        "ph-product": "pegawai!.ph_product",
        "fg": 0,
    };

    // const data:any = await requestPost(API_URL + "/absensi", payload, "lbp_presence="+bearerToken)
    // if(data?.status != '1'){
    //     return HTTPResponse({
    //         status: 400, message: data?.message || "Bad Request"
    //     })
    // }


    return HTTPResponse({
        status: 200, message: "Berhasil get data", data: ""
    })
});

// Register route POST /api/echo
routes.set('POST:/echo', async (req) => {
    const data = await req.json();
    return new Response(JSON.stringify({ youSent: data }), {
        headers: { 'Content-Type': 'application/json' },
    });
});

// Register route GET /api/users/:id (dynamic param)
routes.set('GET:/users/:id', (req, params) => {
    const userId = params.id;
    return new Response(
        JSON.stringify({ userId, message: `User data for ID ${userId}` }),
        { headers: { 'Content-Type': 'application/json' } }
    );
});

export const prerender = false;

export const ALL: APIRoute = async ({ request, params }) => {
    const method = request.method.toUpperCase();
    const pathSegments = Array.isArray(params.all)
        ? params.all
        : typeof params.all === 'string'
            ? [params.all]
            : [];

    // Try exact match first
    const exactKey = `${method}:/${pathSegments.join('/')}`;
    if (routes.has(exactKey)) {
        return routes.get(exactKey)!(request, {});
    }

    // Try dynamic routes
    for (const [key, handler] of routes.entries()) {
        if (!key.startsWith(method)) continue;

        const routePath = key.split(':')[1]; // e.g. "/users/:id"
        const routeSegments = routePath.slice(1).split('/'); // ['users', ':id']

        if (routeSegments.length !== pathSegments.length) continue;

        let matched = true;
        const paramsObj: Record<string, string> = {};

        for (let i = 0; i < routeSegments.length; i++) {
            if (routeSegments[i].startsWith(':')) {
                const paramName = routeSegments[i].slice(1);
                paramsObj[paramName] = pathSegments[i];
            } else if (routeSegments[i] !== pathSegments[i]) {
                matched = false;
                break;
            }
        }

        if (matched) {
            return handler(request, paramsObj);
        }
    }

    return new Response('Not Found', { status: 404 });
};