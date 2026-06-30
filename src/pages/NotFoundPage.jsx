import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-header-bg p-[40px] text-center">
      <div className="font-mono text-[72px] font-bold text-primary-dark opacity-10 leading-none mb-[24px]">404</div>
      <div className="text-[20px] font-extrabold text-primary-dark mb-[8px]">Página não encontrada</div>
      <div className="text-[14px] text-text-secondary font-medium mb-[28px] max-w-[320px]">
        O endereço que você acessou não existe ou foi movido.
      </div>
      <div className="flex gap-[10px]">
        <button
          onClick={() => navigate(-1)}
          className="bg-white border-[1.5px] border-[#cfd4c7] text-primary rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-bold cursor-pointer"
        >
          Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white rounded-sidebar-item py-[10px] px-[20px] text-[14px] font-bold cursor-pointer border-none"
        >
          Ir para o início
        </button>
      </div>
    </div>
  )
}
