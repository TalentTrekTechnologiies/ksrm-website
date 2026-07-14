interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: "1760px",
        margin: "0 auto",
        paddingLeft: "3%",
        paddingRight: "3%",
      }}
    >
      {children}
    </div>
  )
}
