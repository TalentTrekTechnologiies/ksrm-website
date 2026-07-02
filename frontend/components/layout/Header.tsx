import Link from "next/link";

export default function Header() {
  return (
    <header style={{ width: "100%", background: "#fff" }}>
      <Link href="/">
        <video
          width="100%"
          height="auto"
          autoPlay
          loop
          muted
          playsInline
          style={{
            display: "block",
            objectFit: "contain",
            width: "100%",
            height: "auto",
          }}
        >
          <source src="/KSRM LOGO 4Sec.mov" type="video/quicktime" />
          <source src="/header.png" type="image/png" />
        </video>
      </Link>
    </header>
  );
}
