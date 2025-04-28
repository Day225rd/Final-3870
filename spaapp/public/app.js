$(function() {
    // Initialize theme on load
    document.body.dataset.theme = localStorage.getItem('theme') || 'light';
  
    // Theme toggle uses classes only
    $('#themeToggle').on('click', () => {
      const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = next;
      localStorage.setItem('theme', next);
    });
  
    // Show registration when clicking the link
    $('#showRegister').on('click', function(e) {
      e.preventDefault();
      $('#loginForm').addClass('d-none');
      $('#regForm').removeClass('d-none');
    });
  
    // Cancel returns to login
    $('#btnCancel').on('click', () => {
      $('#regForm').addClass('d-none');
      $('#loginForm').removeClass('d-none');
    });
  
    // Password strength
    $('#regPassword').on('input', () => {
      const val = $('#regPassword').val();
      const { score, feedback } = zxcvbn(val);
      $('#pwdStrengthMeter').val(score);
      $('#pwdFeedback').text(feedback.warning || feedback.suggestions[0] || '');
    });
  
    // Show dashboard by toggling classes
    function showDashboard() {
      $('#loginForm, #regForm').addClass('d-none');
      $('#dashboard').removeClass('d-none');
      import('https://cdn.jsdelivr.net/npm/chart.js').then(({ default: Chart }) => {
        new Chart($('#signupChart')[0].getContext('2d'), {
          type: 'line',
          data: {
            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [{ label: 'Sign-ups', data: [5,8,6,10,7,4,9] }]
          }
        });
      });
    }
  
    // Helper to hash passwords
    async function hashPassword(str) {
      const buf  = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2,'0'))
        .join('');
    }
  
    // Login handler
    $('#btnLogin').click(async () => {
      const pwHash = await hashPassword($('#loginPassword').val());
      $.post('/api/login', {
        email: $('#loginEmail').val(),
        password: pwHash
      })
        .done(showDashboard)
        .fail(err => Swal.fire('Error', err.responseText, 'error'));
    });
  
    // Register handler
    $('#btnRegisterSubmit').click(async () => {
      const pwHash = await hashPassword($('#regPassword').val());
      const payload = {
        email:      $('#regEmail').val(),
        password:   pwHash,
        firstName:  $('#firstName').val(),
        lastName:   $('#lastName').val(),
        address1:   $('#addr1').val(),
        address2:   $('#addr2').val(),
        city:       $('#city').val(),
        state:      $('#state').val(),
        zip:        $('#zip').val(),
        phone:      $('#regPhone').val(),
        coopId:     $('#coopId').val()
      };
      $.post('/api/register', payload)
        .done(showDashboard)
        .fail(err => Swal.fire('Error', err.responseText, 'error'));
    });
  });
  