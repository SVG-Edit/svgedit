import Image from "next/image"

export const Logo = () => {
    return (
            <Image
                src="/logo.png"
                alt="logo"
                width={75}
                height={75}
            />
    )
}