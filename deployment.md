# Instruções de Deploy para Vercel

## Problema: MIME Type Incorreto

Se você está recebendo o erro "O carregamento de um módulo foi bloqueado devido a um tipo MIME não permitido", siga estas etapas:

### Solução 1: Configuração via vercel.json (Recomendado)

O arquivo `vercel.json` já está configurado com os headers corretos. Certifique-se de que está na raiz do projeto.

### Solução 2: Verificar Build Settings no Vercel Dashboard

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **General**
4. Verifique as seguintes configurações:

   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` ou `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Solução 3: Variáveis de Ambiente

Se você está usando variáveis de ambiente (como GEMINI_API_KEY):

1. Vá em **Settings** → **Environment Variables**
2. Adicione suas variáveis de ambiente
3. Redesploy o projeto

### Solução 4: Forçar Novo Deploy

Às vezes o cache do Vercel pode causar problemas:

```bash
# Via CLI do Vercel
vercel --prod --force

# Ou via Dashboard
# Settings → Deployments → ... → Redeploy
```

### Solução 5: Verificar package.json

Certifique-se de que o `package.json` tem os scripts corretos:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Solução 6: Limpar Cache e Redeployar

No Vercel Dashboard:
1. Vá em **Settings** → **General**
2. Role até **Build & Development Settings**
3. Ative **Override** em todas as opções se necessário
4. Force um novo deployment

### Checklist Completo

- [ ] `vercel.json` está na raiz do projeto
- [ ] Build command é `vite build` ou `npm run build`
- [ ] Output directory é `dist`
- [ ] Framework preset está como "Vite"
- [ ] Todas as dependências estão no `package.json`
- [ ] Variáveis de ambiente estão configuradas (se necessário)
- [ ] Cache foi limpo e novo deploy foi feito

### Arquivos Importantes

- `vercel.json` - Configuração principal do Vercel
- `vite.config.ts` - Configuração do Vite com build settings
- `package.json` - Scripts e dependências

### Comandos Úteis

```bash
# Instalar dependências
npm install

# Build local para testar
npm run build

# Preview do build
npm run preview

# Deploy via CLI
vercel --prod
```

## Suporte

Se o problema persistir após seguir todos os passos:

1. Verifique os logs de build no Vercel Dashboard
2. Tente fazer deploy em um novo projeto Vercel
3. Contate o suporte do Vercel com os logs de erro