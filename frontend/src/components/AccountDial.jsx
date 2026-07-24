import { useMemo } from "react";

/**
 * AccountDial
 * ---------------------------------------------------------------------------
 * The one deliberately bold element of this UI: each derived account sits on
 * a notch of a vault combination dial. Selecting an account rotates the dial
 * so that account's notch lands under the fixed brass pointer, the way you'd
 * dial in a combination. It's decorative and functional at once - order here
 * carries real information (account index 0, 1, 2, ...).
 * ---------------------------------------------------------------------------
 */
export default function AccountDial({ accounts, activeIndex, onSelect }) {
  const count = accounts.length;
  const anglePerNotch = 360 / Math.max(count, 1);
  const rotation = -activeIndex * anglePerNotch;

  const notches = useMemo(
    () =>
      accounts.map((account, i) => {
        const angle = i * anglePerNotch;
        const rad = (angle * Math.PI) / 180;
        const radius = 92;
        const x = 110 + radius * Math.sin(rad);
        const y = 110 - radius * Math.cos(rad);
        return { account, angle, x, y };
      }),
    [accounts, anglePerNotch]
  );

  return (
    <div className="dial-wrap">
      <div className="dial-pointer" aria-hidden="true" />
      <div className="dial" style={{ transform: `rotate(${rotation}deg)` }}>
        <svg viewBox="0 0 220 220" width="220" height="220">
          <circle cx="110" cy="110" r="104" className="dial-ring-outer" />
          <circle cx="110" cy="110" r="86" className="dial-ring-inner" />
          {notches.map(({ account, x, y }) => (
            <g
              key={account.index}
              className={`dial-notch ${account.index === activeIndex ? "dial-notch-active" : ""}`}
              onClick={() => onSelect(account.index)}
              role="button"
              tabIndex={0}
              aria-label={`Switch to account ${account.index}`}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(account.index)}
              style={{ transform: `translate(${x}px, ${y}px) rotate(${-(-activeIndex * anglePerNotch)}deg)` }}
            >
              <circle r="15" />
              <text x="0" y="5" textAnchor="middle">
                {account.index}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="dial-center">
        <span className="eyebrow">Account</span>
        <span className="dial-center-index">{String(activeIndex).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
