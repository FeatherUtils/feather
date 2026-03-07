import { system, world } from "@minecraft/server";
import { prismarineDb } from "../Libraries/prismarinedb";
import SHA256 from '../Libraries/sha256';
import { JSEncrypt } from '../Libraries/jsencrypt-lib/JSEncrypt';
let pubKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgSVozmH7Jc1n4K1eqR0v6g1sk
okufnqlLSK7uVtiBNSAgkLPU9zxqiH2+OPkScIyMZ2a6DjfRiYCtQ5JMlof+db0g
EmoNzFqGa7Q60lkH2KLkR9kxPWBeanGm+2t6UYEZY8DLrz+kE/Uy7M6/BQQq+wZy
m5kEXzWhbJQTcHBxJwIDAQAB
-----END PUBLIC KEY----- `;
class HTTP {
    constructor() {
        this.player;
        this.requests = new Map();
        this.requests2 = new Map();
    }
}
export default HTTP