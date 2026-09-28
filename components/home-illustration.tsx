export function HomeIllustration() {
  return (
    <div className="home-art" aria-hidden="true">
      <div className="art-caption">
        <span className="small-dot" /> ROOTED IN VICTORIA FALLS
      </div>
      <svg viewBox="0 0 560 470" fill="none" className="house-drawing">
        <circle cx="389" cy="119" r="63" fill="#e8b87e" />
        <path
          d="M28 393c108-62 171 37 267 0s158-32 239 3"
          stroke="#afbb9f"
          strokeWidth="2"
        />
        <path d="M139 233 298 136l158 97v155H139V233Z" fill="#e6e3ce" />
        <path
          d="m108 239 190-122 191 122-18 24-173-110-173 110-17-24Z"
          fill="#244c40"
        />
        <path d="M337 150v-52h39v77" fill="#244c40" />
        <path d="M154 243 298 153v235H154V243Z" fill="#f9f5e9" />
        <rect x="218" y="278" width="64" height="110" rx="32" fill="#ba6548" />
        <circle cx="267" cy="337" r="3" fill="#f9f5e9" />
        <path
          d="M324 267h82v68h-82z"
          fill="#78978c"
          stroke="#244c40"
          strokeWidth="5"
        />
        <path d="M365 267v68m-41-34h82" stroke="#f9f5e9" strokeWidth="4" />
        <path
          d="M211 214h48v38h-48z"
          fill="#78978c"
          stroke="#244c40"
          strokeWidth="4"
        />
        <path d="M235 214v38" stroke="#f9f5e9" strokeWidth="3" />
        <path d="M219 389 190 439h111l-20-50" fill="#d4c9ac" />
        <path
          d="M90 395V245m0 77-36-35m36 66 35-45"
          stroke="#244c40"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse cx="74" cy="255" rx="45" ry="55" fill="#a6b58b" />
        <ellipse cx="106" cy="284" rx="39" ry="49" fill="#8a9f76" />
        <path
          d="M455 388v-44m0 16c-27-4-34-16-28-28 18 0 29 12 28 28Zm0 13c27-4 34-16 28-28-18 0-29 12-28 28Z"
          fill="#789567"
          stroke="#244c40"
          strokeWidth="3"
        />
        <path d="M432 388h46l-8 28h-30l-8-28Z" fill="#ba6548" />
        <path
          d="M135 389h279"
          stroke="#244c40"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="m39 138 9 9 17-19m394 29 9 9 17-19"
          stroke="#658252"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="art-note">
        <span className="note-symbol">⌂</span>
        <div>
          A place worth caring for.
          <small>Home, work, and everywhere in between.</small>
        </div>
      </div>
    </div>
  );
}
