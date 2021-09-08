export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  // console.log('The date is: ' +dateStr)

 // CODE ADDED TO HANDLE DATE FORMAT ERROR
 // note: empty string/corrupted found in validé bills & wrong date format on bills page (eg: 13/05/2020)
 
if (date instanceof Date && !isFinite(date)) 
  return console.error('There is a date format error: ' +dateStr) 
  // if for some reason, corrupted data was introduced we manage here by logging error to console the dateStr: (similar to getbills error handling): temporary fix?
  
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refusé"
  }
}