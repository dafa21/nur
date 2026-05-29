const key = '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';

fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Origin': 'https://nurhealthconnection.com'
  },
  body: JSON.stringify({
    model: 'meta/llama-3.2-90b-vision-instruct',
    messages: [{ role: 'user', content: 'hi' }],
    max_tokens: 20,
    stream: false
  })
}).then(r => {
  console.log('STATUS:', r.status);
  console.log('CORS Allow-Origin:', r.headers.get('access-control-allow-origin'));
  console.log('CORS Allow-Headers:', r.headers.get('access-control-allow-headers'));
  return r.json();
}).then(d => {
  console.log('RESPONSE OK! Content:', d.choices?.[0]?.message?.content || JSON.stringify(d).substring(0, 200));
}).catch(e => console.error('ERROR:', e.message));
