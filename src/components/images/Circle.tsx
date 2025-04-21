export const Circle = () => {
  return (
    <svg
      width="311"
      height="311"
      viewBox="0 0 311 311"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.6">
        <circle cx="155.5" cy="155.5" r="155.5" fill="url(#paint0_radial_6_39)" />
        <circle
          cx="155.5"
          cy="155.5"
          r="153"
          stroke="white"
          stroke-opacity="0.26"
          stroke-width="5"
        />
        <circle cx="156" cy="156" r="103" fill="url(#paint1_radial_6_39)" />
        <circle
          cx="156"
          cy="156"
          r="100.5"
          stroke="white"
          stroke-opacity="0.26"
          stroke-width="5"
        />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_6_39"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(155.5 155.5) rotate(90) scale(155.5)"
        >
          <stop stop-color="#DBFF9A" />
          <stop offset="1" stop-color="#85B729" />
        </radialGradient>
        <radialGradient
          id="paint1_radial_6_39"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(156 156) rotate(90) scale(103)"
        >
          <stop stop-color="#DBFF9A" />
          <stop offset="1" stop-color="#85B729" />
        </radialGradient>
      </defs>
    </svg>
  );
};
