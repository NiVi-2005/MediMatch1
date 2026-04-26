import React, { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import styles from './DataTable.module.css'

export default function DataTable({ columns, data, loading, searchable = true, onSearch, searchPlaceholder = 'Search...', actions, emptyMsg = 'No records found' }) {
  const [page, setPage] = useState(1)
  const [localSearch, setLocalSearch] = useState('')
  const PER_PAGE = 10

  const filtered = onSearch ? data : data?.filter(row =>
    !localSearch || columns.some(col => {
      const val = col.key ? row[col.key] : ''
      return String(val || '').toLowerCase().includes(localSearch.toLowerCase())
    })
  )

  const totalPages = Math.ceil((filtered?.length || 0) / PER_PAGE)
  const paged = filtered?.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleSearch = (val) => {
    setLocalSearch(val)
    setPage(1)
    onSearch?.(val)
  }

  return (
    <div className={styles.container}>
      {(searchable || actions) && (
        <div className={styles.toolbar}>
          {searchable && (
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={e => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={styles.th} style={{ width: col.width }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.center}>
                  <Loader size={22} className={styles.loadSpin} />
                  <span>Loading...</span>
                </td>
              </tr>
            ) : !paged?.length ? (
              <tr>
                <td colSpan={columns.length} className={styles.center}>
                  <span className={styles.emptyMsg}>{emptyMsg}</span>
                </td>
              </tr>
            ) : (
              paged.map((row, ri) => (
                <tr key={ri} className={styles.tr}>
                  {columns.map((col, ci) => (
                    <td key={ci} className={styles.td}>
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className={styles.pageBtns}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2)
              .map(p => (
                <button key={p} onClick={() => setPage(p)} className={`${styles.pageBtn} ${p === page ? styles.pageActive : ''}`}>{p}</button>
              ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
