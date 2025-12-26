import { createSignal } from 'solid-js'
import GeneratePanel from './generate-panel'
import DecryptPanel from './decrypt-panel'
import EncryptPanel from './encrypt-panel'
import SignPanel from './sign-panel'
import VerifyPanel from './verify-panel'

const pannelList = [GeneratePanel, EncryptPanel, DecryptPanel, SignPanel, VerifyPanel]

function App() {
  const [pannel, setPannel] = createSignal(0)

  return (
    <div>
      <h1 class="title">
        🔐 Asymmetric Encryption Tool
      </h1>
      <div class="switchmode-buttons">
        <span class="switchmode-label">Mode Switcher:</span>
        <button onClick={() => {setPannel(0)}}>Generate</button>
        <button onClick={() => {setPannel(1)}}>Encrypt</button>
        <button onClick={() => {setPannel(2)}}>Decrypt</button>
        <button onClick={() => {setPannel(3)}}>Sign</button>
        <button onClick={() => {setPannel(4)}}>Verify</button>
      </div>
      <p class="info">This tool uses the browser's native Web Crypto API. Runs entirely locally, supporting RSA-2048-OAEP + AES-256-GCM hybrid encryption.</p>
      {pannelList[pannel()]}
    </div>
  )
}

export default App
