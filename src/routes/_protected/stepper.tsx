import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/stepper')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="min-h-screen flex flex-col sm:px-6 lg:px-8 max-w-7xl mr-auto ml-auto pt-8 pr-4 pb-8 pl-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-medium text-xs tracking-tight">
                        VA
                    </div>
                    <div className="">
                        <h1 className="text-xl text-zinc-900 font-medium tracking-tight">New Broadcast</h1>
                        <p className="text-xs text-zinc-400">Campaign ID: #BRD-924</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Save Draft</button>
                    <button className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors">Cancel</button>
                </div>
            </div>

            {/* Stepper Navigation */}
            <div className="w-full mb-10">
                <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-zinc-200 -z-10"></div>

                    {/* Step 1: Active */}
                    <div className="flex flex-col items-center gap-2 bg-zinc-50 px-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-medium ring-4 ring-zinc-50">1</div>
                        <span className="text-xs font-medium text-zinc-900">Audience</span>
                    </div>

                    {/* Step 2: Pending */}
                    <div className="flex flex-col items-center gap-2 bg-zinc-50 px-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center text-xs font-medium ring-4 ring-zinc-50">2</div>
                        <span className="text-xs text-zinc-400">Compose</span>
                    </div>

                    {/* Step 3: Pending */}
                    <div className="flex flex-col items-center gap-2 bg-zinc-50 px-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center text-xs font-medium ring-4 ring-zinc-50">3</div>
                        <span className="text-xs text-zinc-400">Review</span>
                    </div>
                </div>
            </div>

            {/* STEP 1: AUDIENCE UI */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mb-12">
                {/* Header with Selection Context */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-6 border-zinc-100 border-b pt-5 pr-5 pb-5 pl-5 gap-x-6 gap-y-6 justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-base text-zinc-900 font-medium tracking-tight">Select Teachers</h2>
                        <p className="text-sm text-zinc-400">Target based on employment, status, and compliance.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 gap-x-4 gap-y-4">
                        {/* Selected Context (Preserved) */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center -space-x-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-medium ring-2 ring-white">EL</div>
                                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-medium ring-2 ring-white">MJ</div>
                                <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-medium ring-2 ring-white">+10</div>
                            </div>
                            <div className="h-4 w-px bg-zinc-200"></div>
                            <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200">12 Selected</span>
                        </div>

                        <div className="hidden sm:block h-6 w-px bg-zinc-200"></div>

                        {/* New Pagination & Show Entries (Shadcn Style) */}
                        <div className="flex gap-4 gap-x-4 gap-y-4 items-center">
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline-block text-xs font-medium text-zinc-500">Rows</span>
                                <button className="flex hover:bg-zinc-50 hover:text-zinc-900 transition-colors focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 outline-none text-xs font-medium text-zinc-600 bg-white w-[64px] h-8 border-zinc-200 border rounded-md pt-1 pr-2.5 pb-1 pl-2.5 shadow-sm gap-x-2 gap-y-2 items-center justify-between">
                                    10
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down opacity-50"><path d="m6 9 6 6 6-6"></path></svg>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">Page 1 of 5</span>
                                <div className="flex items-center gap-1">
                                    <button className="h-8 w-8 flex items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-sm focus:ring-2 focus:ring-zinc-900/10 outline-none" disabled>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"></path></svg>
                                    </button>
                                    <button className="h-8 w-8 flex items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm focus:ring-2 focus:ring-zinc-900/10 outline-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Filter Bar */}
                <div className="flex flex-wrap gap-3 bg-zinc-50/50 border-zinc-200 border-b pt-4 pr-4 pb-4 pl-4 gap-x-3 gap-y-3 items-center">

                    {/* Search */}
                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600">
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:search" data-width="16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m21 21l-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></g></svg>
                        </span>
                        <input type="text" placeholder="Search teacher..." className="pl-9 pr-3 py-1.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-0 w-56 placeholder:text-zinc-400 transition-all"></input>
                    </div>

                    <div className="h-6 w-px bg-zinc-200 mx-1"></div>

                    {/* Subjects Filter (Multi-select simulated) */}
                    <button className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm hover:border-zinc-300 transition-colors text-zinc-900 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:book-open" data-width="16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z"></path></svg>
                        <span>Subjects</span>
                        {/* Counter badge implies multi-selection */}
                        <span className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded-md font-medium border border-zinc-200">2</span>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24" data-icon="lucide:chevron-down" data-width="14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"></path></svg>
                    </button>

                    {/* Availability Filter */}
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm hover:border-zinc-300 transition-colors text-zinc-600">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:clock" data-width="16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></g></svg>
                        <span>Availability</span>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24" data-icon="lucide:chevron-down" data-width="14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"></path></svg>
                    </button>

                    {/* Employment Type (Regular/Non-regular) */}
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm hover:border-zinc-300 transition-colors text-zinc-600">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:briefcase" data-width="16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path><rect width="20" height="14" x="2" y="6" rx="2"></rect></g></svg>
                        <span className="">Type</span>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24" data-icon="lucide:chevron-down" data-width="14" className=""><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6" className=""></path></svg>
                    </button>

                    {/* Document Completeness */}
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm hover:border-zinc-300 transition-colors text-zinc-600">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:file-check" data-width="16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5M9 15l2 2l4-4"></path></g></svg>
                        <span className="">Docs</span>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24" data-icon="lucide:chevron-down" data-width="14" className=""><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"></path></svg>
                    </button>
                </div>

                {/* Teachers Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="">
                            <tr className="border-b border-zinc-100 bg-white text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                <th className="py-3 px-5 w-12">
                                    <label className="custom-checkbox cursor-pointer">
                                        <input type="checkbox" className="sr-only"></input>
                                            <div className="w-4 h-4 border border-zinc-300 rounded bg-white flex items-center justify-center transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 24 24" data-icon="lucide:check" data-width="12" className=""><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                            </div>
                                    </label>
                                </th>
                                <th className="py-3 px-2 font-medium">Teacher</th>
                                <th className="py-3 px-2 font-medium">Employment</th>
                                <th className="py-3 px-2 font-medium">Docs Status</th>
                                <th className="py-3 px-2 font-medium w-1/4">Subjects</th>
                                <th className="py-3 px-2 font-medium">Availability</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-zinc-50">
                            {/* Row 1: Selected */}
                            <tr className="bg-zinc-50/50 hover:bg-zinc-50 transition-colors group">
                                <td className="py-3 px-5">
                                    <label className="custom-checkbox cursor-pointer">
                                        <input type="checkbox" checked className="sr-only"></input>
                                            <div className="w-4 h-4 border border-zinc-300 rounded bg-white flex items-center justify-center transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 24 24" data-icon="lucide:check" data-width="12" className=""><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5" className=""></path></svg>
                                            </div>
                                    </label>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">EL</div>
                                        <div className="">
                                            <p className="text-zinc-900 font-medium">Elena Rigby</p>
                                            <p className="text-xs text-zinc-400">elena@example.com</p>
                                        </div>
                                    </div>
                                </td>
                                {/* Employment Type */}
                                <td className="py-3 px-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200">
                                        Regular
                                    </span>
                                </td>
                                {/* Docs Completeness */}
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-2 group cursor-help">
                                        <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                                        </div>
                                        <span className="text-xs text-emerald-600 font-medium">Verified</span>
                                    </div>
                                </td>
                                {/* Subjects */}
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-blue-100 bg-blue-50 text-xs text-blue-700">Math</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 bg-white text-xs text-zinc-600">Physics</span>
                                    </div>
                                </td>
                                {/* Availability */}
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        <span className="text-zinc-600">Available</span>
                                    </div>
                                </td>
                            </tr>

                            {/* Row 2 */}
                            <tr className="hover:bg-zinc-50 transition-colors group">
                                <td className="py-3 px-5">
                                    <label className="custom-checkbox cursor-pointer">
                                        <input type="checkbox" className="sr-only"></input>
                                            <div className="w-4 h-4 border border-zinc-300 rounded bg-white flex items-center justify-center transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 24 24" data-icon="lucide:check" data-width="12"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                            </div>
                                    </label>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-medium">MJ</div>
                                        <div>
                                            <p className="text-zinc-900 font-medium">Marcus Jones</p>
                                            <p className="text-xs text-zinc-400">marcus.j@example.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-white text-zinc-500 text-xs border border-zinc-200 dashed">
                                        Non-Regular
                                    </span>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400 w-[60%] rounded-full"></div>
                                        </div>
                                        <span className="text-xs text-amber-600 font-medium">1 Missing</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 bg-white text-xs text-zinc-600">Literature</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 bg-white text-xs text-zinc-600">History</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                                        <span className="text-zinc-400">Offline</span>
                                    </div>
                                </td>
                            </tr>

                            {/* Row 3 */}
                            <tr className="hover:bg-zinc-50 transition-colors group">
                                <td className="py-3 px-5">
                                    <label className="custom-checkbox cursor-pointer">
                                        <input type="checkbox" className="sr-only"></input>
                                            <div className="w-4 h-4 border border-zinc-300 rounded bg-white flex items-center justify-center transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 24 24" data-icon="lucide:check" data-width="12" className=""><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"></path></svg>
                                            </div>
                                    </label>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium">SC</div>
                                        <div className="">
                                            <p className="text-zinc-900 font-medium">Sarah Connor</p>
                                            <p className="text-xs text-zinc-400">sarah.c@example.com</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200">
                                        Regular
                                    </span>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                                        </div>
                                        <span className="text-xs text-emerald-600 font-medium">Verified</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-blue-100 bg-blue-50 text-xs text-blue-700">Math</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 bg-white text-xs text-zinc-600">Chemistry</span>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                        <span className="text-zinc-600">Busy</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Pagination/Footer */}
                <div className="flex bg-zinc-50/30 border-zinc-100 border-t pt-4 pr-4 pb-4 pl-4 items-center justify-between">
                    <span className="text-xs text-zinc-400">Showing 3 of 148 teachers</span>
                    <div className="flex gap-1">
                        <button className="px-2 py-1 border border-zinc-200 rounded bg-white hover:bg-zinc-50 disabled:opacity-50" disabled>
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:chevron-left" data-width="16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 18l-6-6l6-6"></path></svg>
                        </button>
                        <button className="px-2 py-1 border border-zinc-200 rounded bg-white hover:bg-zinc-50">
                            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:chevron-right" data-width="16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 18l6-6l-6-6"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 py-8 opacity-40">
                <div className="h-px bg-zinc-300 flex-1"></div>
                <span className="text-xs uppercase tracking-widest font-medium">Draft Composition</span>
                <div className="h-px bg-zinc-300 flex-1"></div>
            </div>


            {/* STEP 2: COMPOSE UI (Preserved) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

                {/* Settings Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Channel Selection */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
                        <h3 className="text-sm font-medium text-zinc-900 mb-4">Channels</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer custom-switch group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="18" height="18" viewBox="0 0 24 24" data-icon="lucide:mail" data-width="18"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect width="20" height="16" x="2" y="4" rx="2"></rect></g></svg>
                                    </div>
                                    <div className="">
                                        <p className="text-sm font-medium text-zinc-900">Email</p>
                                        <p className="text-xs text-zinc-400">Send via SMTP</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input type="checkbox" checked className="sr-only"></input>
                                        <div className="w-9 h-5 bg-zinc-200 rounded-full transition-colors duration-200">
                                            <span className="absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200"></span>
                                        </div>
                                </div>
                            </label>

                            <div className="h-px bg-zinc-100"></div>

                            <label className="flex items-center justify-between cursor-pointer custom-switch group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="18" height="18" viewBox="0 0 24 24" data-icon="lucide:message-circle" data-width="18"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092a10 10 0 1 0-4.777-4.719"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">WhatsApp</p>
                                        <p className="text-xs text-zinc-400">Official Business API</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only"></input>
                                        <div className="w-9 h-5 bg-zinc-200 rounded-full transition-colors duration-200">
                                            <span className="absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200"></span>
                                        </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Template Selector */}


                    {/* Dynamic Variables Helper */}
                    <div className="bg-white border-zinc-200 border rounded-xl pt-5 pr-5 pb-5 pl-5 shadow-sm">
                        <h3 className="text-sm font-medium text-zinc-900 mb-3">Template</h3>
                        <div className="relative">
                            <select className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm rounded-lg p-2.5 pr-8 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none">
                                <option>Monthly Newsletter</option>
                                <option>Urgent Announcement</option>
                                <option>Event Invitation</option>
                                <option>Custom Message</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-500">
                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24" data-icon="lucide:chevron-down" data-width="14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9l6 6l6-6"></path></svg>
                            </div>
                        </div>
                    </div><div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
                        <h3 className="text-sm font-medium text-zinc-900 mb-3">Insert Variable</h3>
                        <div className="flex flex-wrap gap-2">
                            <button className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-xs text-zinc-600 font-mono transition-colors">first_name</button>
                            <button className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-xs text-zinc-600 font-mono transition-colors">subject</button>
                            <button className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-xs text-zinc-600 font-mono transition-colors">date_today</button>
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 h-full flex flex-col">
                        <div className="border-b border-zinc-100 p-4 bg-zinc-50/30 rounded-t-xl">
                            <input type="text" value="Important Update regarding [Subject]" className="w-full bg-transparent text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none" placeholder="Email Subject Line"></input>
                        </div>

                        {/* Editor Toolbar */}
                        <div className="px-4 py-2 border-b border-zinc-100 flex gap-4 text-zinc-400">
                            <button className="hover:text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:bold" data-width="16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"></path></svg></button>
                            <button className="hover:text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:italic" data-width="16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 4h-9m4 16H5M15 4L9 20"></path></svg></button>
                            <button className="hover:text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:link" data-width="16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></g></svg></button>
                            <button className="hover:text-zinc-600"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="16" height="16" viewBox="0 0 24 24" data-icon="lucide:list" data-width="16"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h.01M3 12h.01M3 19h.01M8 5h13M8 12h13M8 19h13"></path></svg></button>
                        </div>

                        <div className="p-6 flex-1">
                            <div className="prose prose-sm max-w-none text-zinc-600 font-normal">
                                <p className="">Hi <span className="bg-yellow-50 text-yellow-700 px-1 py-0.5 rounded border border-yellow-100 text-xs font-mono">first_name</span>,</p>

                                <p className="">We wanted to inform you about the upcoming changes to the curriculum for <span className="bg-yellow-50 text-yellow-700 px-1 py-0.5 rounded border border-yellow-100 text-xs font-mono">subject_list</span>.</p>
                                <p className="">Please review the attached documents before the meeting on <span className="bg-yellow-50 text-yellow-700 px-1 py-0.5 rounded border border-yellow-100 text-xs font-mono">meeting_time</span>.</p>

                                <p className="">Best regards,Admin Team</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STEP 3: REVIEW UI (Preserved) */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-12">
                <h2 className="text-base text-zinc-900 font-medium tracking-tight mb-6">Review &amp; Send</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card */}
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                        <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Recipients</div>
                        <div className="text-2xl text-zinc-900 font-medium tracking-tight">12 <span className="text-sm text-zinc-400 font-normal">Teachers</span></div>
                    </div>

                    {/* Stat Card */}
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                        <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Estimated Cost</div>
                        <div className="text-2xl text-zinc-900 font-medium tracking-tight">$0.04 <span className="text-sm text-zinc-400 font-normal">via SMTP</span></div>
                    </div>

                    {/* Preview Mini */}
                    <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-zinc-400 uppercase tracking-wide font-medium mb-1">Scheduled For</div>
                            <div className="text-base text-zinc-900 font-medium">Immediately</div>
                        </div>
                        <button className="text-xs text-zinc-500 underline hover:text-zinc-800">Change</button>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button className="px-5 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">Back</button>
                    <button className="px-5 py-2.5 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200 transition-all flex items-center gap-2">
                        <span>Send Broadcast</span>
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="14" height="14" viewBox="0 0 24 24" data-icon="lucide:send" data-width="14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11zm7.318-19.539l-10.94 10.939"></path></svg>
                    </button>
                </div>
            </div>

        </div>
    )
}
