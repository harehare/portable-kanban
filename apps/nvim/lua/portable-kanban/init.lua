--- portable-kanban.nvim
--- Neovim plugin for portable-kanban: opens a TUI (Node.js/Ink) to view/edit .kanban files.

local M = {}
M.opts = {}

local function find_tui()
  local script_dir = vim.fn.fnamemodify(debug.getinfo(1, 'S').source:sub(2), ':p:h:h:h')
  local candidates = {
    script_dir .. '/node_modules/.bin/portable-kanban-tui',
    script_dir .. '/dist/tui.mjs',
    script_dir .. '/dist/tui.js',
  }
  for _, path in ipairs(candidates) do
    if vim.fn.filereadable(path) == 1 then
      return path
    end
  end
  return nil
end

--- Open a .kanban file in the TUI.
--- @param filepath string path to the .kanban file
function M.open(filepath)
  filepath = filepath or vim.fn.expand('%:p')

  if not filepath:match('%.kanban$') then
    vim.notify('portable-kanban: not a .kanban file', vim.log.levels.ERROR)
    return
  end

  local tui = find_tui()
  if not tui then
    vim.notify('portable-kanban: TUI not found. Run `pnpm build` in apps/nvim.', vim.log.levels.ERROR)
    return
  end

  local cmd
  if tui:match('%.mjs$') or tui:match('%.js$') then
    cmd = { 'node', tui, filepath }
  else
    cmd = { tui, filepath }
  end

  -- Build environment: pass keymap config to the TUI process
  local env = {}
  if M.opts.keymaps and next(M.opts.keymaps) then
    env.PORTABLE_KANBAN_KEYMAPS = vim.json.encode(M.opts.keymaps)
  end

  -- Open the TUI in a new full-screen terminal buffer
  vim.cmd('tabnew')
  local buf = vim.api.nvim_get_current_buf()
  vim.fn.termopen(cmd, {
    env = env,
    on_exit = function(_, code, _)
      if code ~= 0 then
        vim.notify('portable-kanban: TUI exited with code ' .. code, vim.log.levels.WARN)
      end
      -- Reload the buffer if the file was modified
      vim.cmd('checktime')
    end,
  })

  -- Send raw ESC byte to the TUI process so ink can handle it (q/Esc → back in detail view).
  -- Neovim's default <Esc> in terminal mode exits to normal mode; we override that here.
  -- To escape to Neovim normal mode manually, use <C-\><C-n>.
  vim.keymap.set('t', '<Esc>', function()
    local channel = vim.bo[buf].channel
    if channel and channel > 0 then
      vim.api.nvim_chan_send(channel, '\27')
    end
  end, { buffer = buf, noremap = true, desc = 'Pass raw Esc to portable-kanban TUI' })

  -- Re-enter terminal mode automatically when this buffer is focused.
  -- Prevents h/j/k/l from being captured by Neovim normal mode if user accidentally exits.
  vim.api.nvim_create_autocmd('BufEnter', {
    buffer = buf,
    callback = function()
      vim.cmd('startinsert')
    end,
    desc = 'Auto re-enter terminal mode for portable-kanban',
  })

  vim.cmd('startinsert')
end

--- Create a new .kanban file and open it.
function M.new()
  local filepath = vim.fn.input('New kanban file path: ', vim.fn.getcwd() .. '/', 'file')
  if filepath == '' then
    return
  end
  if not filepath:match('%.kanban$') then
    filepath = filepath .. '.kanban'
  end

  local initial = vim.json.encode({
    lists = {
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'Backlog', cards = {} },
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'To Do', cards = {} },
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'Doing', cards = {} },
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'Done', cards = {} },
    },
    archive = { lists = {}, cards = {} },
    settings = { labels = {} },
  })

  local file = io.open(filepath, 'w')
  if not file then
    vim.notify('portable-kanban: failed to create file: ' .. filepath, vim.log.levels.ERROR)
    return
  end
  file:write(initial)
  file:close()

  M.open(filepath)
end

--- Setup function to register commands and keymaps.
---
--- @param opts table optional configuration:
---   opts.auto_open  boolean  auto-open TUI for .kanban files
---   opts.keymaps    table    override TUI keybindings, e.g.:
---     {
---       quit            = 'q',   -- quit TUI  (board)
---       list_prev       = 'h',   -- previous list
---       list_next       = 'l',   -- next list
---       card_up         = 'k',   -- card up
---       card_down       = 'j',   -- card down
---       card_add        = 'a',   -- add card
---       card_edit       = 'e',   -- edit card title
---       card_delete     = 'd',   -- delete card
---       card_move_left  = 'H',   -- move card left
---       card_move_right = 'L',   -- move card right
---       help            = '?',   -- show help
---     }
function M.setup(opts)
  opts = opts or {}
  M.opts = opts

  vim.api.nvim_create_user_command('KanbanOpen', function(cmd_opts)
    local filepath = (cmd_opts.args ~= '') and cmd_opts.args or nil
    M.open(filepath)
  end, { desc = 'Open .kanban file in TUI', nargs = '?', complete = 'file' })

  vim.api.nvim_create_user_command('KanbanNew', function()
    M.new()
  end, { desc = 'Create and open a new .kanban file' })

  -- Auto-open TUI when a .kanban file is opened
  if opts.auto_open then
    vim.api.nvim_create_autocmd({ 'BufReadCmd', 'BufNewFile' }, {
      pattern = '*.kanban',
      callback = function()
        M.open(vim.fn.expand('<afile>:p'))
      end,
      desc = 'Auto-open portable-kanban TUI for .kanban files',
    })
  end
end

return M
  filepath = filepath or vim.fn.expand('%:p')

  if not filepath:match('%.kanban$') then
    vim.notify('portable-kanban: not a .kanban file', vim.log.levels.ERROR)
    return
  end

  local tui = find_tui()
  if not tui then
    vim.notify('portable-kanban: TUI not found. Run `pnpm build` in apps/nvim.', vim.log.levels.ERROR)
    return
  end

  local cmd
  if tui:match('%.mjs$') or tui:match('%.js$') then
    cmd = { 'node', tui, filepath }
  else
    cmd = { tui, filepath }
  end

  -- Open the TUI in a new full-screen terminal buffer
  vim.cmd('tabnew')
  local buf = vim.api.nvim_get_current_buf()
  vim.fn.termopen(cmd, {
    on_exit = function(_, code, _)
      if code ~= 0 then
        vim.notify('portable-kanban: TUI exited with code ' .. code, vim.log.levels.WARN)
      end
      -- Reload the buffer if the file was modified
      vim.cmd('checktime')
    end,
  })

  -- Send raw ESC byte to the TUI process so ink can handle it (q/Esc → back in detail view).
  -- Neovim's default <Esc> in terminal mode exits to normal mode; we override that here.
  -- To escape to Neovim normal mode manually, use <C-\><C-n>.
  vim.keymap.set('t', '<Esc>', function()
    local channel = vim.bo[buf].channel
    if channel and channel > 0 then
      vim.api.nvim_chan_send(channel, '\27')
    end
  end, { buffer = buf, noremap = true, desc = 'Pass raw Esc to portable-kanban TUI' })

  -- Re-enter terminal mode automatically when this buffer is focused.
  -- Prevents h/j/k/l from being captured by Neovim normal mode if user accidentally exits.
  vim.api.nvim_create_autocmd('BufEnter', {
    buffer = buf,
    callback = function()
      vim.cmd('startinsert')
    end,
    desc = 'Auto re-enter terminal mode for portable-kanban',
  })

  vim.cmd('startinsert')
end

--- Create a new .kanban file and open it.
function M.new()
  local filepath = vim.fn.input('New kanban file path: ', vim.fn.getcwd() .. '/', 'file')
  if filepath == '' then
    return
  end
  if not filepath:match('%.kanban$') then
    filepath = filepath .. '.kanban'
  end

  local initial = vim.json.encode({
    lists = {
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'Backlog', cards = {} },
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'To Do', cards = {} },
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'Doing', cards = {} },
      { id = vim.fn.system('uuidgen'):gsub('%s+', ''), title = 'Done', cards = {} },
    },
    archive = { lists = {}, cards = {} },
    settings = { labels = {} },
  })

  local file = io.open(filepath, 'w')
  if not file then
    vim.notify('portable-kanban: failed to create file: ' .. filepath, vim.log.levels.ERROR)
    return
  end
  file:write(initial)
  file:close()

  M.open(filepath)
end

--- Setup function to register commands and keymaps.
--- @param opts table optional configuration
function M.setup(opts)
  opts = opts or {}

  vim.api.nvim_create_user_command('KanbanOpen', function(cmd_opts)
    local filepath = (cmd_opts.args ~= '') and cmd_opts.args or nil
    M.open(filepath)
  end, { desc = 'Open .kanban file in TUI', nargs = '?', complete = 'file' })

  vim.api.nvim_create_user_command('KanbanNew', function()
    M.new()
  end, { desc = 'Create and open a new .kanban file' })

  -- Auto-open TUI when a .kanban file is opened
  if opts.auto_open then
    vim.api.nvim_create_autocmd({ 'BufReadCmd', 'BufNewFile' }, {
      pattern = '*.kanban',
      callback = function()
        M.open(vim.fn.expand('<afile>:p'))
      end,
      desc = 'Auto-open portable-kanban TUI for .kanban files',
    })
  end
end

return M
