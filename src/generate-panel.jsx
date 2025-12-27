import * as openpgp from 'openpgp';
import { createSignal } from 'solid-js'
import copy from './copy';

export default () => {
    const [pubKey, setPubKey] = createSignal('')
    const [privKey, setPrivKey] = createSignal('')
    const [name, setName] = createSignal('')
    const [email, setEmail] = createSignal('')
    const [passphrase, setPassphrase] = createSignal('')
    const [algo, setAlgo] = createSignal('{"type":"rsa","rsaBits":2048}')
    const [status, setStatus] = createSignal('')

    const generateKeyPair = async () => {
        try {
            setStatus("Generating keypair...")

            const options = {
                userIDs: [{ name: name(), email: email() }],
                passphrase: passphrase() || undefined
            }

            const { privateKey, publicKey } = await openpgp.generateKey(Object.assign(options, JSON.parse(algo())))

            setPubKey(publicKey)
            setPrivKey(privateKey)

            setStatus("Keypair generated 🎉")
        } catch (err) {
            setStatus("❌ Failed to generate keypair" + JSON.stringify({ name: err.name, message: err.message }))
        }
    }

    const downloadPublicKey = () => {
        const blob = new Blob([pubKey()], { type: "application/pgp-keys" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${email() || "public-key"}.asc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadPrivateKey = () => {
        const blob = new Blob([privKey()], { type: "application/pgp-keys" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${email() || "private-key"}.asc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return <div class="card">
        <h2>1. Generate Keypair</h2>
        <div style={{"font-weight": "900","font-size": "large","overflow": "auto"}}>Fill the information and then <a style={{color:"blue","text-decoration":"underline"}} onclick={generateKeyPair}>Generate</a> the key.</div>
        <div class="generate-config">

            <div>
                <label htmlFor="nameInput">Name:</label>
                <input
                    type="text"
                    id="nameInput"
                    value={name()}
                    onInput={e => setName(e.currentTarget.value)}
                />
            </div>

            <div>
                <label htmlFor="emailInput">Email:</label>
                <input
                    type="text"
                    id="emailInput"
                    value={email()}
                    onInput={e => setEmail(e.currentTarget.value)}
                />
            </div>

            <div>
                <label htmlFor="passphraseInput">Passphrase (optional):</label>
                <input
                    type="password"
                    id="passphraseInput"
                    value={passphrase()}
                    onInput={e => setPassphrase(e.currentTarget.value)}
                />
            </div>

            <div>
                <label htmlFor="algoSelect">Algorithm:</label>
                <select
                    id="algoSelect"
                    value={algo()}
                    onInput={e => setAlgo(e.currentTarget.value)}
                >
                    {/* RSA */}
                    <option value={`{"type":"rsa","rsaBits":1024}`}>RSA 1024 (Encryption / Signing, Low security, Not recommended)</option>
                    <option value={`{"type":"rsa","rsaBits":2048}`}>RSA 2048 (Encryption / Signing, Recommended, Good compatibility)</option>
                    <option value={`{"type":"rsa","rsaBits":3072}`}>RSA 3072 (Encryption / Signing, High security)</option>
                    <option value={`{"type":"rsa","rsaBits":4096}`}>RSA 4096 (Encryption / Signing, Very high security, Slow)</option>

                    {/* ECC */}
                    <option value={`{"type":"ecc","curve":"curve25519"}`}>ECC Curve25519 (Key exchange / Encrypt session keys)</option>
                    <option value={`{"type":"ecc","curve":"ed25519"}`}>ECC Ed25519 (Signing / Verification)</option>
                    <option value={`{"type":"ecc","curve":"p256"}`}>ECC P-256 (Signing / Key exchange)</option>
                    <option value={`{"type":"ecc","curve":"p384"}`}>ECC P-384 (Signing / Key exchange, High security)</option>
                    <option value={`{"type":"ecc","curve":"p521"}`}>ECC P-521 (Signing / Key exchange, Very high security)</option>

                </select>
            </div>
            <br />

        </div>
        <div id="keyGenStatus" class="status">{status()}</div>

        <div class="grid" style="margin-top: 15px;">
            <div>
                <label>Public Key (For Encryption)</label>
                <textarea
                    id="pubKeyDisplay"
                    value={pubKey()}
                    readonly
                    placeholder="Generated public key will appear here..."
                />
                <button class="secondary" hidden={window.telegram != null} onclick={() => { copy(pubKey()) }}>Copy Public Key</button>
                <button class="secondary" onclick={downloadPublicKey}>Download Public Key</button>
            </div>

            <div>
                <label>Private Key (For Decryption)</label>
                <textarea
                    id="privKeyDisplay"
                    value={privKey()}
                    readonly
                    placeholder="Generated private key will appear here..."
                />
                <button class="secondary" hidden={window.telegram != null} onclick={() => { copy(privKey()) }}>Copy Private Key</button>
                <button class="secondary" onclick={downloadPrivateKey}>Download Private Key</button>
            </div>
        </div>
    </div >
}
