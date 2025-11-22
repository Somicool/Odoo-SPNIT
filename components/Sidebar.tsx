'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  History, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SubMenuItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: SubMenuItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Operations', 
    icon: FileText,
    subItems: [
      { name: 'Receipt', href: '/documents/receipts' },
      { name: 'Delivery', href: '/documents/deliveries' },
      { name: 'Adjustment', href: '/documents/adjustments' },
    ]
  },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Move History', href: '/ledger', icon: History },
  { 
    name: 'Settings', 
    icon: Settings,
    subItems: [
      { name: 'Warehouse', href: '/warehouses' },
      { name: 'Locations', href: '/warehouses/locations' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Operations', 'Settings']);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentActive = (subItems?: SubMenuItem[]) => {
    if (!subItems) return false;
    return subItems.some(item => isActive(item.href));
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900">
      <div className="flex h-16 items-center justify-center border-b border-purple-700/50 bg-gradient-to-r from-indigo-800/50 to-purple-800/50 backdrop-blur-sm px-4">
        <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          StockMaster
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isMenuOpen = openMenus.includes(item.name);
          const itemActive = item.href ? isActive(item.href) : isParentActive(item.subItems);

          return (
            <div key={item.name}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`
                      group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all
                      ${
                        itemActive
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 transform scale-105'
                          : 'text-slate-300 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    {isMenuOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isMenuOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`
                            block rounded-md px-3 py-2 text-sm transition-all
                            ${
                              isActive(subItem.href)
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 font-medium text-white shadow-md shadow-cyan-500/30 transform scale-105'
                                : 'text-slate-400 hover:bg-gradient-to-r hover:from-purple-700/50 hover:to-indigo-700/50 hover:text-white'
                            }
                          `}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`
                    group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all
                    ${
                      itemActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 transform scale-105'
                        : 'text-slate-300 hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
