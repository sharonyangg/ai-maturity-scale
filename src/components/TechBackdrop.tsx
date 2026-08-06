/**
 * 全站共用的深色科技感背景：細網格 + 兩顆低透明度的藍/靛光暈。
 * 用 fixed 鋪滿視窗、-z-10，各頁面內容維持透明背景疊在上面即可。
 * 純裝飾、無互動，不需要 "use client"。
 */
export function TechBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05070d]">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #3987e5 1px, transparent 1px), linear-gradient(to bottom, #3987e5 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        className="absolute -top-52 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full opacity-40 blur-[130px]"
        style={{ background: "radial-gradient(circle, #2a78d6, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-56 -right-32 h-[520px] w-[520px] rounded-full opacity-25 blur-[130px]"
        style={{ background: "radial-gradient(circle, #4a3aa7, transparent 70%)" }}
      />
    </div>
  );
}
