// Shared front-end logic for both index.html and admin.html
// NOTE: supabase client is created in each html before loading this file

// Utility: simple DOM selector
const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel))

// If on index.html page: wire navigation and fetching
if (document.body.contains($('#home'))) {
  // Navigation
  $$('.card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = btn.dataset.page
      if (page) showPage(page)
    })
  })

  // Back buttons
  $$('.back').forEach(b => b.addEventListener('click', () => showPage('home')))

  // Get Session button - open WhatsApp with prefilled text
  $('#get-session').addEventListener('click', () => {
    const wa = 'https://wa.me/917389637366?text=' + encodeURIComponent('send me session id')
    window.open(wa, '_blank')
  })

  // Panel code content (the code you provided)
  const panelCode = `const { spawnSync, spawn } = require('child_process')\nconst { existsSync, writeFileSync } = require('fs')\nconst path = require('path')\n\nconst SESSION_ID = 'updateThis' // Edit this line only, don't remove ' <- this symbol\n\nlet nodeRestartCount = 0\nconst maxNodeRestarts = 5\nconst restartWindow = 30000 // 30 seconds\nlet lastRestartTime = Date.now()\n\nfunction startNode() {\n  const child = spawn('node', ['index.js'], { cwd: 'levanter', stdio: 'inherit' })\n\n  child.on('exit', (code) => {\n    if (code !== 0) {\n      const currentTime = Date.now()\n      if (currentTime - lastRestartTime > restartWindow) {\n        nodeRestartCount = 0\n      }\n      lastRestartTime = currentTime\n      nodeRestartCount++\n\n      if (nodeRestartCount > maxNodeRestarts) {\n        console.error('Node.js process is restarting continuously. Stopping retries...')\n        return\n      }\n      console.log(\n        `Node.js process exited with code ${code}. Restarting... (Attempt ${nodeRestartCount})`\n      )\n      startNode()\n    }\n  })\n}\n\nfunction startPm2() {\n  const pm2 = spawn('yarn', ['pm2', 'start', 'index.js', '--name', 'levanter', '--attach'], {\n    cwd: 'levanter',\n    stdio: ['pipe', 'pipe', 'pipe'],\n  })\n\n  let restartCount = 0\n  const maxRestarts = 5 // Adjust this value as needed\n\n  pm2.on('exit', (code) => {\n    if (code !== 0) {\n      // console.log('yarn pm2 failed to start, falling back to node...')\n      startNode()\n    }\n  })\n\n  pm2.on('error', (error) => {\n    console.error(`yarn pm2 error: ${error.message}`)\n    startNode()\n  })\n\n  // Check for infinite restarts\n  if (pm2.stderr) {\n    pm2.stderr.on('data', (data) => {\n      const output = data.toString()\n      if (output.includes('restart')) {\n        restartCount++\n        if (restartCount > maxRestarts) {\n          // console.log('yarn pm2 is restarting indefinitely, stopping yarn pm2 and starting node...')\n          spawnSync('yarn', ['pm2', 'delete', 'levanter'], { cwd: 'levanter', stdio: 'inherit' })\n          startNode()\n        }\n      }\n    })\n  }\n\n  if (pm2.stdout) {\n    pm2.stdout.on('data', (data) => {\n      const output = data.toString()\n      console.log(output)\n      if (output.includes('Connecting')) {\n        // console.log('Application is online.')\n        restartCount = 0\n      }\n    })\n  }\n}\n\nfunction installDependencies() {\n  // console.log('Installing dependencies...')\n  const installResult = spawnSync(\n    'yarn',\n    ['install', '--force', '--non-interactive', '--network-concurrency', '3'],\n    {\n      cwd: 'levanter',\n      stdio: 'inherit',\n      env: { ...process.env, CI: 'true' }, // Ensure non-interactive environment\n    }\n  )\n\n  if (installResult.error || installResult.status !== 0) {\n    console.error(\n      `Failed to install dependencies: ${\n        installResult.error ? installResult.error.message : 'Unknown error'\n      }`\n    )\n    process.exit(1) // Exit the process if installation fails\n  }\n}\n\nfunction checkDependencies() {\n  if (!existsSync(path.resolve('levanter/package.json'))) {\n    console.error('package.json not found!')\n    process.exit(1)\n  }\n\n  const result = spawnSync('yarn', ['check', '--verify-tree'], {\n    cwd: 'levanter',\n    stdio: 'inherit',\n  })\n\n  // Check the exit code to determine if there was an error\n  if (result.status !== 0) {\n    console.log('Some dependencies are missing or incorrectly installed.')\n    installDependencies()\n  } else {\n    // console.log('All dependencies are installed properly.')\n  }\n}\n\nfunction cloneRepository() {\n  // console.log('Cloning the repository...')\n  const cloneResult = spawnSync(\n    'git',\n    ['clone', 'https://github.com/lyfe00011/levanter.git', 'levanter'],\n    {\n      stdio: 'inherit',\n    }\n  )\n\n  if (cloneResult.error) {\n    throw new Error(`Failed to clone the repository: ${cloneResult.error.message}`)\n  }\n\n  const configPath = 'levanter/config.env'\n  try {\n    // console.log('Writing to config.env...')\n    writeFileSync(configPath, `VPS=true\\nSESSION_ID=${SESSION_ID}`)\n  } catch (err) {\n    throw new Error(`Failed to write to config.env: ${err.message}`)\n  }\n\n  installDependencies()\n}\n\nif (!existsSync('levanter')) {\n  cloneRepository()\n  checkDependencies()\n} else {\n  checkDependencies()\n}\n\nstartPm2()`

  $('#panel-code').textContent = panelCode

  // Panel code copy
  $('#copy-panel-code').addEventListener('click', () => {
    const hidden = document.getElementById('hidden-copy')
    hidden.value = panelCode
    hidden.select()
    document.execCommand('copy')
    alert('Panel code copied to clipboard')
  })

  // Functions to render data
  async function fetchAndRender() {
    await renderPlugins()
    await renderEnv()
    await renderTools()
  }

  function showPage(pageId){
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'))
    const target = document.getElementById(pageId)
    if (target) target.classList.add('active')
    window.scrollTo({top:0,behavior:'smooth'})
  }

  // --- Plugins ---
  async function renderPlugins(){
    const list = $('#plugins-list')
    list.innerHTML = '<em>Loading...</em>'
    const { data, error } = await supabase.from('plugins').select('*').order('id', {ascending:false})
    list.innerHTML = ''
    if (error) { list.innerHTML = '<div class="muted">Error loading</div>'; return }
    data.forEach(p => {
      const card = document.createElement('div')
      card.className = 'card'
      card.innerHTML = `<h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.about||'')}</p><button class="btn copy-link" data-link="${escapeHtml(p.link||'')}">Copy Link</button>`
      list.appendChild(card)
    })

    $$('.copy-link').forEach(btn=> btn.addEventListener('click', (e)=>{
      const hidden = document.getElementById('hidden-copy')
      hidden.value = btn.dataset.link || ''
      hidden.select()
      document.execCommand('copy')
      alert('Hidden link copied')
    }))
  }

  // --- Env ---
  async function renderEnv(){
    const list = $('#env-list')
    list.innerHTML = '<em>Loading...</em>'
    const { data, error } = await supabase.from('env').select('*').order('id', {ascending:false})
    list.innerHTML = ''
    if (error) { list.innerHTML = '<div class="muted">Error loading</div>'; return }
    data.forEach(e => {
      const card = document.createElement('div')
      card.className = 'card'
      card.innerHTML = `<h3>${escapeHtml(e.name)}</h3><p><button class="btn show-values">Show Values</button></p><div class="values" style="display:none"></div>`
      list.appendChild(card)
      const showBtn = card.querySelector('.show-values')
      const valuesDiv = card.querySelector('.values')
      showBtn.addEventListener('click', ()=>{
        if (valuesDiv.style.display === 'none'){
          const vals = e.values || []
          valuesDiv.innerHTML = ''
          vals.forEach(v=>{
            const line = document.createElement('div')
            line.style.marginTop = '6px'
            line.innerHTML = `<code>${escapeHtml(v)}</code> <button class="btn small copy-value">Copy</button>`
            valuesDiv.appendChild(line)
          })
          valuesDiv.style.display = 'block'
          // wire copy
          valuesDiv.querySelectorAll('.copy-value').forEach((b, i)=> b.addEventListener('click', ()=>{ const hidden = $('#hidden-copy'); hidden.value = e.values[i]; hidden.select(); document.execCommand('copy'); alert('Value copied') }))
        } else {
          valuesDiv.style.display = 'none'
        }
      })
    })
  }

  // --- Tools ---
  async function renderTools(){
    const list = $('#tools-list')
    list.innerHTML = '<em>Loading...</em>'
    const { data, error } = await supabase.from('tools').select('*').order('id', {ascending:false})
    list.innerHTML = ''
    if (error) { list.innerHTML = '<div class="muted">Error loading</div>'; return }
    data.forEach(t => {
      const card = document.createElement('div')
      card.className = 'card'
      card.innerHTML = `<h3>${escapeHtml(t.name)}</h3><pre class="code-block">${escapeHtml(t.data||'')}</pre><button class="btn copy-tool" data-data='${escapeHtml(t.data||'')}' >Copy</button>`
      list.appendChild(card)
    })

    $$('.copy-tool').forEach(btn=> btn.addEventListener('click', ()=>{
      const hidden = document.getElementById('hidden-copy')
      hidden.value = btn.dataset.data || ''
      hidden.select()
      document.execCommand('copy')
      alert('Tool data copied')
    }))
  }

  // Escape HTML utility
  function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/[&<>"']/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}) }

  // Fetch and render initially
  fetchAndRender()

  // Subscribe to realtime changes (requires Realtime enabled in Supabase)
  try{
    const pluginSub = supabase.channel('public:plugins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plugins' }, payload => { renderPlugins() })
      .subscribe()

    const envSub = supabase.channel('public:env')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'env' }, payload => { renderEnv() })
      .subscribe()

    const toolsSub = supabase.channel('public:tools')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tools' }, payload => { renderTools() })
      .subscribe()
  } catch (e){ console.warn('Realtime subscription not available or failed', e) }
}

// If on admin.html page: admin functions
if (document.body.classList.contains('admin-container') || document.body.contains($('#login-area'))) {
  // Elements
  const loginArea = $('#login-area')
  const adminArea = $('#admin-area')
  const loginBtn = $('#login-btn')

  loginBtn.addEventListener('click', async () => {
    const pass = $('#admin-pass').value
    if (pass === 'SHUBHAM777'){
      loginArea.style.display = 'none'
      adminArea.style.display = 'block'
      await loadAdminData()
    } else {
      alert('Incorrect password')
    }
  })

  $('#logout').addEventListener('click', ()=>{ adminArea.style.display='none'; loginArea.style.display='block'; document.getElementById('admin-pass').value=''; })

  async function loadAdminData(){
    // Plugins
    const { data: plugins } = await supabase.from('plugins').select('*').order('id',{ascending:false})
    const pList = $('#admin-plugins'); pList.innerHTML = ''
    plugins.forEach(p=>{
      const c = document.createElement('div'); c.className='card'; c.innerHTML = `<h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(p.about)}</p><p><button class="btn del-plugin" data-id="${p.id}">Delete</button></p>`
      pList.appendChild(c)
    })
    $$('.del-plugin').forEach(b=> b.addEventListener('click', async ()=>{ if(confirm('Delete?')){ await supabase.from('plugins').delete().eq('id', b.dataset.id); loadAdminData() } }))

    // Env
    const { data: envs } = await supabase.from('env').select('*').order('id',{ascending:false})
    const eList = $('#admin-env'); eList.innerHTML = ''
    envs.forEach(e=>{ const c=document.createElement('div'); c.className='card'; c.innerHTML = `<h4>${escapeHtml(e.name)}</h4><pre>${escapeHtml((e.values||[]).join('\n'))}</pre><p><button class="btn del-env" data-id="${e.id}">Delete</button></p>`; eList.appendChild(c) })
    $$('.del-env').forEach(b=> b.addEventListener('click', async ()=>{ if(confirm('Delete?')){ await supabase.from('env').delete().eq('id', b.dataset.id); loadAdminData() } }))

    // Tools
    const { data: tools } = await supabase.from('tools').select('*').order('id',{ascending:false})
    const tList = $('#admin-tools'); tList.innerHTML = ''
    tools.forEach(t=>{ const c=document.createElement('div'); c.className='card'; c.innerHTML = `<h4>${escapeHtml(t.name)}</h4><pre>${escapeHtml(t.data||'')}</pre><p><button class="btn del-tool" data-id="${t.id}">Delete</button></p>`; tList.appendChild(c) })
    $$('.del-tool').forEach(b=> b.addEventListener('click', async ()=>{ if(confirm('Delete?')){ await supabase.from('tools').delete().eq('id', b.dataset.id); loadAdminData() } }))

    // Wire add buttons
    $('#add-plugin').onclick = async () => {
      const name = $('#p-name').value.trim(); const about = $('#p-about').value.trim(); const link = $('#p-link').value.trim()
      if(!name){ alert('Name required'); return }
      await supabase.from('plugins').insert({ name, about, link })
      $('#p-name').value='';$('#p-about').value='';$('#p-link').value=''
      loadAdminData()
    }

    $('#add-env').onclick = async () => {
      const name = $('#e-name').value.trim(); const vals = $('#e-values').value.trim()
      if(!name){ alert('Name required'); return }
      // parse comma separated or newline values
      const values = vals.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean)
      await supabase.from('env').insert({ name, values })
      $('#e-name').value='';$('#e-values').value=''
      loadAdminData()
    }

    $('#add-tool').onclick = async () => {
      const name = $('#t-name').value.trim(); const data = $('#t-data').value
      if(!name){ alert('Name required'); return }
      await supabase.from('tools').insert({ name, data })
      $('#t-name').value='';$('#t-data').value=''
      loadAdminData()
    }
  }
}

// End of file
