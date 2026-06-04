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
        margin: "0 auto",
        paddingLeft: "5%",
        paddingRight: "5%",
      }}
    >
      {children}
    </div>
  )
}
