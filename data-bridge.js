/* Bridge Supabase data into the site-first dashboard. */
var sites = [];
var trips = [];
async function refreshMarhanDashboardData(){
  try {
    const [s,tr] = await Promise.all([
      db.from('santiyeler').select('*').order('id',{ascending:false}),
      db.from('seferler').select('*').order('id',{ascending:false})
    ]);
    if(!s.error) sites = s.data || [];
    if(!tr.error) trips = tr.data || [];
  } catch(e){ console.error('Dashboard data sync failed',e); }
}
refreshMarhanDashboardData();
setTimeout(refreshMarhanDashboardData,700);
const originalSaveSite = window.saveSite;
if(typeof originalSaveSite === 'function'){
  window.saveSite = async function(){
    await originalSaveSite.apply(this,arguments);
    await refreshMarhanDashboardData();
  };
}
