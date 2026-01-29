import type { ReactNode } from 'react'

type PagePlaceholderProps = {
  title: string
  description: string
  children?: ReactNode
}

const PagePlaceholder = ({
  title,
  description,
  children,
}: PagePlaceholderProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    {children ? <div className="mt-4">{children}</div> : null}
  </section>
)

export default PagePlaceholder
