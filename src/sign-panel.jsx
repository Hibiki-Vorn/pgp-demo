import * as openpgp from "openpgp";
import { createSignal } from "solid-js";
import UploadKey from "./Upload-key";
import copy from './copy';

export default () => {
  const [privateKeyText, setPrivateKeyText] = createSignal("");
  const [passphrase, setPassphrase] = createSignal("");
  const [plainText, setPlainText] = createSignal("");
  const [signedText, setSignedText] = createSignal("");
  const [fileRef, setFileRef] = createSignal(null);
  const [status, setStatus] = createSignal("");

  /** 签名文本（Cleartext Signed） **/
  const signText = async () => {
    try {
      setStatus("Signing text...");

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

      const message = await openpgp.createCleartextMessage({
        text: plainText(),
      });

      const signed = await openpgp.sign({
        message,
        signingKeys: privateKey,
      });

      setSignedText(signed);
      setStatus("Text signed successfully 🎉");
    } catch (err) {
      setStatus("❌ Failed to sign text" + JSON.stringify({ name: err.name, message: err.message }));
    }
  };

  /** 文件签名（Detached Signature） **/
  const signFile = async () => {
    try {
      const file = fileRef()?.files?.[0];
      if (!file) return;

      setStatus("Signing file...");

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

      const buffer = new Uint8Array(await file.arrayBuffer());

      const message = await openpgp.createMessage({ binary: buffer });

      const { signature } = await openpgp.sign({
        message,
        signingKeys: privateKey,
        detached: true,
        format: "binary",
      });

      const blob = new Blob([signature], {
        type: "application/pgp-signature",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name + ".sig";
      a.click();
      URL.revokeObjectURL(url);

      setStatus("File signed successfully 🎉");
    } catch (err) {
      setStatus("❌ Failed to sign file" + JSON.stringify({ name: err.name, message: err.message }));
    }
  };

  return (
    <div class="card">
      <h2>4. Sign (require private key)</h2>

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
        {/* Text Signing */}
        <div>
          <label>Option A: Sign Text</label>

          <textarea
            value={plainText()}
            onInput={(e) => setPlainText(e.currentTarget.value)}
            placeholder="Enter text to sign..."
          />

          <button onclick={signText}>Sign Text</button>

          <textarea
            readonly
            value={signedText()}
            placeholder="Signed cleartext message here..."
          />

          <button
            class="secondary"
            hidden={window.telegram != null}
            onclick={() => copy(signedText())}
          >
            Copy Signed Text
          </button>
        </div>

        {/* File Signing */}
        <div>
          <label>Option B: Sign File</label>

          <input
            type="file"
            hidden
            ref={(el) => setFileRef(el)}
            onChange={signFile}
          />

          <button onclick={() => fileRef().click()}>
            Select and Generate .sig
          </button>
        </div>
      </div>

      <div class="status">{status()}</div>
    </div>
  );
};
