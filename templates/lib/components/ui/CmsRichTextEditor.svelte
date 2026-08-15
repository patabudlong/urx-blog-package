<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';

	type Props = {
		name?: string;
		value?: string;
		required?: boolean;
		label?: string;
		minHeight?: string;
	};

	let {
		name = 'content',
		value = '',
		required = false,
		label = 'Content',
		minHeight = '16rem'
	}: Props = $props();

	let editorElement = $state<HTMLDivElement | null>(null);
	let editor = $state<Editor | null>(null);
	let html = $state('');
	let active = $state({
		bold: false,
		italic: false,
		strike: false,
		h2: false,
		h3: false,
		bulletList: false,
		orderedList: false,
		blockquote: false,
		link: false
	});

	function syncActiveStates(current: Editor) {
		active = {
			bold: current.isActive('bold'),
			italic: current.isActive('italic'),
			strike: current.isActive('strike'),
			h2: current.isActive('heading', { level: 2 }),
			h3: current.isActive('heading', { level: 3 }),
			bulletList: current.isActive('bulletList'),
			orderedList: current.isActive('orderedList'),
			blockquote: current.isActive('blockquote'),
			link: current.isActive('link')
		};
	}

	function toolbarClass(isActive: boolean): string {
		return isActive
			? 'cms-rich-text-editor__toolbar-btn cms-rich-text-editor__toolbar-btn--active'
			: 'cms-rich-text-editor__toolbar-btn';
	}

	function setLink() {
		if (!editor) return;

		const previousUrl = editor.getAttributes('link').href as string | undefined;
		const url = window.prompt('Link URL', previousUrl ?? 'https://');

		if (url === null) return;

		if (url.trim() === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}

		editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
	}

	onMount(() => {
		if (!editorElement) return;

		const instance = new Editor({
			element: editorElement,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
					HTMLAttributes: { rel: 'noopener noreferrer' }
				})
			],
			content: value,
			editorProps: {
				attributes: {
					class: 'cms-rich-text-editor__content'
				}
			},
			onUpdate: ({ editor: current }) => {
				html = current.isEmpty ? '' : current.getHTML();
				syncActiveStates(current);
			},
			onSelectionUpdate: ({ editor: current }) => {
				syncActiveStates(current);
			}
		});

		editor = instance;
		html = instance.isEmpty ? '' : instance.getHTML();
		syncActiveStates(instance);
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div class="sm:col-span-2">
	<span class="cms-label">{label}</span>
	<div class="cms-rich-text-editor__frame">
		<div class="cms-rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
			<button
				type="button"
				class={toolbarClass(active.bold)}
				disabled={!editor}
				aria-pressed={active.bold}
				onclick={() => editor?.chain().focus().toggleBold().run()}
			>
				B
			</button>
			<button
				type="button"
				class="{toolbarClass(active.italic)} italic"
				disabled={!editor}
				aria-pressed={active.italic}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
			>
				I
			</button>
			<button
				type="button"
				class="{toolbarClass(active.strike)} line-through"
				disabled={!editor}
				aria-pressed={active.strike}
				onclick={() => editor?.chain().focus().toggleStrike().run()}
			>
				S
			</button>
			<span class="cms-rich-text-editor__toolbar-divider" aria-hidden="true"></span>
			<button
				type="button"
				class={toolbarClass(active.h2)}
				disabled={!editor}
				aria-pressed={active.h2}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				H2
			</button>
			<button
				type="button"
				class={toolbarClass(active.h3)}
				disabled={!editor}
				aria-pressed={active.h3}
				onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
			>
				H3
			</button>
			<span class="cms-rich-text-editor__toolbar-divider" aria-hidden="true"></span>
			<button
				type="button"
				class={toolbarClass(active.bulletList)}
				disabled={!editor}
				aria-pressed={active.bulletList}
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
			>
				Bullets
			</button>
			<button
				type="button"
				class={toolbarClass(active.orderedList)}
				disabled={!editor}
				aria-pressed={active.orderedList}
				onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			>
				Numbered
			</button>
			<button
				type="button"
				class={toolbarClass(active.blockquote)}
				disabled={!editor}
				aria-pressed={active.blockquote}
				onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			>
				Quote
			</button>
			<button
				type="button"
				class={toolbarClass(active.link)}
				disabled={!editor}
				aria-pressed={active.link}
				onclick={setLink}
			>
				Link
			</button>
			<span class="cms-rich-text-editor__toolbar-divider" aria-hidden="true"></span>
			<button
				type="button"
				class="cms-rich-text-editor__toolbar-btn"
				disabled={!editor}
				onclick={() => editor?.chain().focus().undo().run()}
			>
				Undo
			</button>
			<button
				type="button"
				class="cms-rich-text-editor__toolbar-btn"
				disabled={!editor}
				onclick={() => editor?.chain().focus().redo().run()}
			>
				Redo
			</button>
		</div>

		<div
			bind:this={editorElement}
			class="cms-rich-text-editor"
			style:--editor-min-height={minHeight}
		></div>
	</div>

	<textarea {name} {required} class="sr-only" bind:value={html} aria-hidden="true" tabindex="-1"
	></textarea>
</div>
