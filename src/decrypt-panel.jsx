import * as openpgp from "openpgp";
import { createSignal } from "solid-js";
import UploadKey from "./Upload-key";

export default () => {
  const [privateKeyText, setPrivateKeyText] = createSignal("");
  const [passphrase, setPassphrase] = createSignal("");
  const [cipherText, setCipherText] = createSignal("");
  const [plainText, setPlainText] = createSignal("");
  const [fileRef, setFileRef] = createSignal(null);
  const [status, setStatus] = createSignal("");

  /** 解密文本 **/
  const decryptText = async () => {
    try {
      setStatus("Decrypting text...");
      let privateKey;
      if (passphrase() !== "") {
        privateKey = await openpgp.decryptKey({
          privateKey: await openpgp.readPrivateKey({
            armoredKey: privateKeyText(),
          }),
          passphrase: passphrase(),
        });
      } else {
        privateKey = await openpgp.readPrivateKey({
          armoredKey: privateKeyText(),
        });
      }

      const message = await openpgp.readMessage({
        armoredMessage: cipherText(),
      });

      const { data } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
      });

      setPlainText(data);
      setStatus("Text decrypted successfully 🎉");
    } catch (err) {
      setStatus("❌ Failed to decrypt text." + JSON.stringify({ name: err.name, message: err.message }));
    }
  };

  /** 解密文件 **/
  const decryptFile = async () => {
    try {
      const file = fileRef().files[0];
      if (!file) return;

      setStatus("Decrypting file...");
      const arrayBuffer = await file.arrayBuffer();
      const encryptedBytes = new Uint8Array(arrayBuffer);

      let privateKey;
      if (passphrase() !== "") {
        privateKey = await openpgp.decryptKey({
          privateKey: await openpgp.readPrivateKey({
            armoredKey: privateKeyText(),
          }),
          passphrase: passphrase(),
        });
      } else {
        privateKey = await openpgp.readPrivateKey({
          armoredKey: privateKeyText(),
        });
      }

      const message = await openpgp.readMessage({
        binaryMessage: encryptedBytes,
      });

      const { data } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey,
      });

      // data 是 Uint8Array
      const blob = new Blob([data]);
      let filename = file.name.replace(/\.pgp$/i, "");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "decrypted_file";
      a.click();
      URL.revokeObjectURL(url);

      setStatus("File decrypted successfully 🎉");
    } catch (err) {
      setStatus("❌ Failed to decrypt file." + JSON.stringify({ name: err.name, message: err.message }));
    }
  };

  return (
    <div class="card">
      <h2>3. Decrypt (require private key)</h2>

      <label>
        <div>Enter recipient private key or</div>
        <UploadKey callback={setPrivateKeyText} />
      </label>
      <textarea
        value={privateKeyText()}
        onInput={(e) => setPrivateKeyText(e.currentTarget.value)}
        placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----"
      />

      <label>Passphrase (if any)</label>
      <input
        type="password"
        value={passphrase()}
        onInput={(e) => setPassphrase(e.currentTarget.value)}
      />

      <div class="grid">
        <div>
          <label>Option A: Decrypt Text</label>
          <textarea
            value={cipherText()}
            onInput={(e) => setCipherText(e.currentTarget.value)}
            placeholder="Paste encrypted PGP text..."
          />
          <button onclick={decryptText}>Decrypt Text</button>

          <textarea readonly value={plainText()} placeholder="Decrypted result..." />
          <button
            class="secondary"
            hidden={window.telegram != null}
            onclick={() => window.navigator.clipboard.writeText(plainText())}
          >
            Copy Decrypted Text
          </button>
        </div>

        <div>
          <label>Option B: Decrypt File</label>

          <input
            type="file"
            hidden
            ref={(el) => setFileRef(el)}
            onChange={decryptFile}
            accept=".pgp,.gpg"
          />

          <button onclick={() => fileRef().click()}>
            Select and Decrypt File
          </button>
        </div>
      </div>

      <div class="status">{status()}</div>
    </div>
  );
};
