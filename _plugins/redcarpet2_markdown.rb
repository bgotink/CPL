require 'fileutils'
require 'digest/md5'
require 'redcarpet'
require 'pygments'

PYGMENTS_CACHE_DIR = File.expand_path('../../_cache', __FILE__)
FileUtils.mkdir_p(PYGMENTS_CACHE_DIR)

class Redcarpet2Markdown < Redcarpet::Render::XHTML

  def block_code(code, lang)
    lang = lang || "text"
    path = File.join(PYGMENTS_CACHE_DIR, "#{lang}-#{Digest::MD5.hexdigest code}.html")
    cache(path) do
      colorized = Pygments.highlight(code, :lexer => lang.downcase)
      add_code_tags_pre(colorized, lang)
    end
  end

  def codespan(code)
    return super unless code[0..1].downcase == "c " || code[0..4].downcase == "java "

    if code[0..4].downcase == "java "
      lang = "Java"
      rcode = code[5..-1]
    else
      lang = "C"
      rcode = code[2..-1]
    end

    path = File.join(PYGMENTS_CACHE_DIR, "#{lang}-#{Digest::MD5.hexdigest rcode}.html")
    cache(path) do
      colorized = Pygments.highlight(rcode, :lexer => lang.downcase)
      add_code_tags(colorized, lang).chomp
    end
  end

  def add_code_tags_pre(code, lang)
    code.sub(/<pre>/, "<pre><code class=\"#{lang.capitalize}\">").
         sub(/<\/pre>/, "</code></pre>")
  end

  def add_code_tags(code, lang)
    code.sub(/<pre>/, "<code class=\"#{lang.capitalize}\">").
         sub(/<\/pre>/, "</code>").
         sub(/<div class="highlight">/, "<span class=\"highlight\">").
         sub(/\s*<\/div>/, "</span>").
         sub(/\n/, "")
  end

  def cache(path)
    if File.exist?(path)
      File.read(path)
    else
      content = yield
      File.open(path, 'w') {|f| f.print(content) }
      content
    end
  end
end

class Jekyll::MarkdownConverter

  def extensions
    Hash[ *@config['redcarpet']['extensions'].map {|e| [e.to_sym, true] }.flatten ]
  end

  def markdown
    @markdown ||= Redcarpet::Markdown.new(Redcarpet2Markdown.new(extensions), extensions)
  end

  def convert(content)
    return super unless @config['markdown'] == 'redcarpet2'
#    puts(content)
#    puts(markdown.render(content))
     markdown.render(content)
  end

end
