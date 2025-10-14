# Example Frontend Component

This directory contains example implementations for integrating AutoMail into your frontend.

## Files

- **signup-component.html** - Standalone example with styling and JavaScript
- More examples coming soon (React, Vue, Svelte, etc.)

## Quick Start

The `signup-component.html` file is a complete, working example that includes:

- Email validation
- Form submission handling
- Success/error messages
- Turnstile integration (commented out, easy to enable)
- Responsive design
- Accessible markup

### Basic Integration

Copy this pattern into your existing site:

```javascript
const response = await fetch('/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    source: 'homepage' 
  })
});

const data = await response.json();
// { success: true, message: "...", position: 42 }
```

## Customization

### Styling

The example uses inline styles for portability. For production:

1. Extract styles to your CSS framework (Tailwind, Bootstrap, etc.)
2. Match your brand colors
3. Add animations/transitions

### Bot Protection

To enable Turnstile (recommended for public sites):

1. Get keys from Cloudflare Dashboard
2. Set `PUBLIC_TURNSTILE_SITE_KEY` in wrangler.toml
3. Set `TURNSTILE_SECRET_KEY` via wrangler secret
4. Uncomment Turnstile code in the example

### Analytics

Track signups with your analytics:

```javascript
// Google Analytics
gtag('event', 'signup', {
  event_category: 'Waitlist'
});

// Plausible
plausible('Signup');

// Custom
fetch('/analytics/track', { 
  method: 'POST', 
  body: JSON.stringify({ event: 'signup' }) 
});
```

## Framework Examples

### React

```jsx
import { useState } from 'react';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'landing' })
    });
    const data = await res.json();
    setStatus(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Join Waitlist</button>
      {status?.success && <p>{status.message}</p>}
    </form>
  );
}
```

### Vue 3

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" required />
    <button type="submit">Join Waitlist</button>
    <p v-if="status">{{ status.message }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const status = ref(null);

async function handleSubmit() {
  const res = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, source: 'landing' })
  });
  status.value = await res.json();
}
</script>
```

## API Response

```typescript
// Success
{
  success: true,
  message: "Welcome to the waitlist!" | "Check your email to confirm...",
  position: number  // User's position in the list
}

// Error
{
  success: false,
  error: "Invalid email address" | "Verification required" | etc.
}
```

## Best Practices

1. **Validate client-side** - Check email format before submitting
2. **Show clear feedback** - Success and error messages
3. **Disable during submission** - Prevent duplicate requests
4. **Track analytics** - Measure conversion rates
5. **Add bot protection** - Use Turnstile for public forms
6. **Mobile-friendly** - Test on all devices
7. **Accessible** - Use semantic HTML, ARIA labels
8. **Clear privacy** - Link to privacy policy

## Need Help?

Questions about integration? Open an issue or email hello@automem.ai

