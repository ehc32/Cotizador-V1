import { Menu, Settings, ExternalLink } from "lucide-react"
import logo from "@/public/471146904_122180586404046741_1301462224554776152_n.jpg"

export const Header = () => {
  return (
    <div className="fixed right-0 left-0 w-full top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logo.src || "/placeholder.svg"} alt="SAAVE" className="h-8" />
            <div className="hidden sm:block">
              <h2 className="text-lg font-light text-gray-800 tracking-wide">SAAVE</h2>
              <p className="text-xs text-gray-500 -mt-1">ARQUITECTOS</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.saavearquitectos.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <ExternalLink size={14} />
            Visita nuestra página
          </a>
         
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors sm:hidden">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
